"use client";

import { Crosshair, Droplets, Flame, Factory, Hospital, Layers3, Minus, Plus, RadioTower, RotateCcw, Route, School, TrainFront, Zap } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StyleSpecification } from "maplibre-gl";
import Map, { Layer, Marker, NavigationControl, ScaleControl, Source, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { createInfrastructureGeoJSON, createInfrastructureLeaderGeoJSON, createLocalPlumeGeoJSON, createSmokeTextureGeoJSON, createWindVectorGeoJSON, distanceKm } from "@/lib/geo";
import { DEMO_INFRASTRUCTURE } from "@/lib/demo-data";
import type { InfrastructureType, LayerId } from "@/lib/types";

const INITIAL_VIEW = { latitude: 45.4215, longitude: -75.6972, zoom: 11.5, bearing: 0, pitch: 0 };
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: { tactical: { type: "raster", tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"], tileSize: 256, attribution: "© OpenStreetMap © CARTO" } },
  layers: [{ id: "tactical-background", type: "background", paint: { "background-color": "#081722" } }, { id: "tactical-raster", type: "raster", source: "tactical", paint: { "raster-opacity": 0.52, "raster-saturation": -0.35, "raster-contrast": 0.12 } }]
};

function InfrastructureGlyph({ type }: { type: InfrastructureType }) {
  if (type === "school") return <School size={15} aria-hidden="true" />;
  if (type === "hospital") return <Hospital size={15} aria-hidden="true" />;
  if (type === "transit") return <TrainFront size={15} aria-hidden="true" />;
  if (type === "fire-station") return <Flame size={15} aria-hidden="true" />;
  if (type === "utility") return <Zap size={15} aria-hidden="true" />;
  if (type === "communications") return <RadioTower size={15} aria-hidden="true" />;
  if (type === "water") return <Droplets size={15} aria-hidden="true" />;
  if (type === "road") return <Route size={15} aria-hidden="true" />;
  return <Factory size={15} aria-hidden="true" />;
}

function infrastructureLabel(type: InfrastructureType) {
  const labels: Record<InfrastructureType, string> = { school: "SCHOOL", hospital: "HOSPITAL", transit: "TRANSIT HUB", "fire-station": "FIRE STATION", utility: "POWER SUBSTATION", communications: "COMMUNICATIONS", water: "WATER PLANT", road: "ROAD" };
  return labels[type];
}
const layerLabels: ReadonlyArray<readonly [LayerId, string]> = [["plume", "Probable impact zone"], ["uncertainty", "Forecast uncertainty"], ["infrastructure", "Critical infrastructure"], ["wind", "Wind vector"], ["denseGasLimitation", "Dense-gas limitation"], ["schools", "Schools"], ["hospitals", "Hospitals"], ["roads", "Roads"], ["transit", "Transit"]];

export function MapLibreIncidentMap() {
  const { incident, weather, forecast, currentFrame, layers, placeIncident, toggleLayer } = useSimulation();
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const minutes = currentFrame?.minutes ?? forecast.currentMinutes;
  const plumeOptions = { origin: incident, windDirection: weather.windDirection, windSpeedKmh: weather.windSpeedKmh, releaseRateKgS: incident.releaseRateKgS, releaseDurationMinutes: incident.durationMinutes, currentMinutes: minutes };
  const plume = useMemo(() => createLocalPlumeGeoJSON(plumeOptions), [incident, weather, minutes]);
  const smokeTexture = useMemo(() => createSmokeTextureGeoJSON(plumeOptions), [incident, weather, minutes]);
  const infrastructure = forecast.status === "ready" && currentFrame ? currentFrame.infrastructure : DEMO_INFRASTRUCTURE;
  const infrastructureGeoJSON = useMemo(() => createInfrastructureGeoJSON(infrastructure), [infrastructure]);
  const infrastructureLeaders = useMemo(() => createInfrastructureLeaderGeoJSON(incident, infrastructure), [incident, infrastructure]);
  const windVector = useMemo(() => createWindVectorGeoJSON(incident, weather.windDirection, weather.windSpeedKmh), [incident, weather.windDirection, weather.windSpeedKmh]);
  const style = process.env.NEXT_PUBLIC_MAP_STYLE_URL || FALLBACK_STYLE;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function placeFromMap(event: MapLayerMouseEvent) {
    placeIncident(Number(event.lngLat.lat.toFixed(6)), Number(event.lngLat.lng.toFixed(6)));
  }

  function visibleInfrastructure(type: InfrastructureType) {
    if (!layers.infrastructure) return false;
    if (type === "school") return layers.schools;
    if (type === "hospital") return layers.hospitals;
    if (type === "transit") return layers.transit;
    return layers.roads;
  }

  return <div className="map-stage" ref={containerRef} role="application" aria-label="Ottawa forecast map. Click to place the incident location.">
    <Map ref={mapRef} initialViewState={INITIAL_VIEW} mapStyle={style} reuseMaps onClick={placeFromMap} onError={(event) => setMapError(event.error?.message ?? "Map tiles could not be loaded.")} onLoad={() => { setMapError(null); mapRef.current?.resize(); }} style={{ width: "100%", height: "100%" }} attributionControl={false}>
      <NavigationControl position="top-right" showCompass={false} showZoom={false} /><ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
      <Source id="local-plume" type="geojson" data={plume}>
        <Layer id="local-plume-fill" type="fill" filter={["match", ["get", "zone"], ["monitoring", "advisory", "shelter", "evacuation", "severe"], true, false]} layout={{ visibility: layers.plume ? "visible" : "none" }} paint={{ "fill-color": ["get", "fillColor"], "fill-opacity": ["get", "opacity"] }} />
        <Layer id="local-plume-outline" type="line" filter={["match", ["get", "zone"], ["monitoring", "advisory", "shelter", "evacuation", "severe"], true, false]} layout={{ visibility: layers.plume ? "visible" : "none" }} paint={{ "line-color": ["get", "outlineColor"], "line-width": 1.5, "line-opacity": 0.85 }} />
        <Layer id="outer-exposure-fill" type="fill" filter={["==", ["get", "zone"], "outerExposure"]} layout={{ visibility: layers.plume ? "visible" : "none" }} paint={{ "fill-color": "#66d9ff", "fill-opacity": 0.08 }} />
        <Layer id="outer-exposure-outline" type="line" filter={["==", ["get", "zone"], "outerExposure"]} layout={{ visibility: layers.plume ? "visible" : "none" }} paint={{ "line-color": "#8be5ff", "line-width": 1.2, "line-opacity": 0.45 }} />
        <Layer id="dense-gas-boundary" type="line" filter={["==", ["get", "zone"], "denseGasLimitation"]} layout={{ visibility: layers.denseGasLimitation ? "visible" : "none" }} paint={{ "line-color": "#ffffff", "line-width": 1.2, "line-dasharray": [2, 3], "line-opacity": 0.7 }} />
        <Layer id="local-uncertainty" type="fill" filter={["==", ["get", "zone"], "uncertainty"]} layout={{ visibility: layers.uncertainty ? "visible" : "none" }} paint={{ "fill-color": "#79d7ff", "fill-opacity": 0.05 }} />
        <Layer id="local-uncertainty-outline" type="line" filter={["==", ["get", "zone"], "uncertainty"]} layout={{ visibility: layers.uncertainty ? "visible" : "none" }} paint={{ "line-color": "#79d7ff", "line-width": 1.4, "line-dasharray": [2, 2], "line-opacity": 0.8 }} />
      </Source>
      <Source id="plume-texture" type="geojson" data={smokeTexture}><Layer id="plume-smoke-texture" type="circle" layout={{ visibility: layers.plume ? "visible" : "none" }} paint={{ "circle-color": "#ddd9d2", "circle-radius": ["get", "radius"], "circle-opacity": ["get", "opacity"], "circle-blur": 0.85 }} /></Source>
      <Source id="infrastructure-leaders" type="geojson" data={infrastructureLeaders}><Layer id="infrastructure-leader-lines" type="line" layout={{ visibility: layers.infrastructure ? "visible" : "none" }} paint={{ "line-color": ["get", "color"], "line-width": 1, "line-opacity": 0.42, "line-dasharray": [1, 2] }} /></Source>
      <Source id="demo-infrastructure" type="geojson" data={infrastructureGeoJSON}><Layer id="demo-infrastructure-points" type="circle" layout={{ visibility: "none" }} paint={{ "circle-radius": 4, "circle-color": "#102a38", "circle-stroke-color": "#82c6dc", "circle-stroke-width": 1.5 }} /></Source>
      {infrastructure.filter((feature) => visibleInfrastructure(feature.type) && feature.latitude !== undefined && feature.longitude !== undefined).map((feature) => <Marker key={feature.id} latitude={feature.latitude ?? 0} longitude={feature.longitude ?? 0} anchor="center"><button type="button" className={`map-infrastructure-callout map-infrastructure-callout--${feature.type}`} aria-label={`${feature.name}, ${distanceKm(incident, { latitude: feature.latitude ?? incident.latitude, longitude: feature.longitude ?? incident.longitude }).toFixed(1)} kilometers`} onClick={(event) => event.stopPropagation()}><span className="map-callout-icon"><InfrastructureGlyph type={feature.type} /></span><span className="map-callout-copy"><b>{infrastructureLabel(feature.type)}</b><small>{distanceKm(incident, { latitude: feature.latitude ?? incident.latitude, longitude: feature.longitude ?? incident.longitude }).toFixed(1)} km</small></span></button></Marker>)}
      <Marker latitude={incident.latitude} longitude={incident.longitude} anchor="center" draggable onDragEnd={(event) => placeIncident(Number(event.lngLat.lat.toFixed(6)), Number(event.lngLat.lng.toFixed(6)))}><button type="button" className="incident-map-marker" aria-label={`Incident source at ${incident.latitude}, ${incident.longitude}`} onClick={(event) => event.stopPropagation()}><span className="incident-map-marker__dot" /><span className="incident-map-marker__label">INCIDENT<br /><b>UI DEMO ESTIMATE</b></span></button></Marker>
    </Map>
    <div className="map-wind-card"><span>Wind {weather.windSpeedKmh} km/h {weather.windDirection}</span><div className="map-wind-arrows" aria-hidden="true"><i /><i /><i /></div></div>
    <div className="map-north-indicator" aria-label="North indicator"><span>N</span><b>▲</b></div>
    <div className="map-map-label">{forecast.status === "idle" ? "DEMO MAP · PLACE AN INCIDENT TO BEGIN" : `MODEL FRAME · ${minutes} MINUTES`}</div>
    {layers.denseGasLimitation && <div className="map-model-note">DENSE-GAS LIMITATION · UI DEMO ESTIMATE</div>}
    {mapError && <div className="map-error" role="alert">MAP LOAD ISSUE · {mapError}</div>}
    {!process.env.NEXT_PUBLIC_MAP_STYLE_URL && !mapError && <div className="map-style-note">TACTICAL FALLBACK STYLE · UI DEMO</div>}
    <div className="map-toolbar" onClick={(event) => event.stopPropagation()}><button type="button" aria-label="Recenter map" onClick={() => mapRef.current?.flyTo({ center: [incident.longitude, incident.latitude], duration: 350 })}><Crosshair size={16} /></button><button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn({ duration: 180 })}><Plus size={16} /></button><button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut({ duration: 180 })}><Minus size={16} /></button><button type="button" aria-label="Reset north" onClick={() => mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 250 })}><RotateCcw size={16} /></button><button type="button" aria-label="Toggle layers" aria-expanded={layersOpen} onClick={() => setLayersOpen((open) => !open)}><Layers3 size={16} /></button></div>
    {layersOpen && <div className="map-layer-popover" role="group" aria-label="Map layers" onClick={(event) => event.stopPropagation()}>{layerLabels.map(([layer, label]) => <label className="map-layer-option" key={layer}><input type="checkbox" checked={Boolean(layers[layer])} onChange={() => toggleLayer(layer)} /><span>{label}</span></label>)}</div>}
  </div>;
}
