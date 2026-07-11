"use client";

import { Crosshair, Layers3, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { mapPercentToGeo, panViewport, resetViewport, viewportPointToPercent, zoomViewport, type MapViewport } from "@/lib/map-utils";
import { DEMO_INFRASTRUCTURE } from "@/lib/demo-data";
import { PlumeLayer } from "@/components/map/PlumeLayer";
import { RiskZoneLayer } from "@/components/map/RiskZoneLayer";
import { WindIndicator } from "@/components/map/WindIndicator";
import type { InfrastructureType, LayerId } from "@/lib/types";

function InfrastructureGlyph({ type }: { type: InfrastructureType }) {
  if (type === "school") return <span className="map-marker-glyph glyph-school">◆</span>;
  if (type === "hospital") return <span className="map-marker-glyph glyph-hospital">H</span>;
  if (type === "transit") return <span className="map-marker-glyph glyph-transit">▣</span>;
  if (type === "fire-station") return <span className="map-marker-glyph glyph-fire">✦</span>;
  return <span className="map-marker-glyph glyph-road">·</span>;
}

export function IncidentMap() {
  const { incident, weather, forecast, currentFrame, layers, placeIncident, toggleLayer } = useSimulation();
  const [viewport, setViewport] = useState<MapViewport>(resetViewport);
  const [layersOpen, setLayersOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; viewport: MapViewport; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const minutes = currentFrame?.minutes ?? forecast.currentMinutes;
  const plumeVisible = layers.plume && forecast.status !== "idle";
  const markerX = ((incident.longitude + 75.82) / 0.16) * 1000;
  const markerY = ((45.47 - incident.latitude) / 0.045) * 760;
  const infrastructure = forecast.status === "ready" && currentFrame ? currentFrame.infrastructure : DEMO_INFRASTRUCTURE;

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current || (event.target instanceof Element && event.target.closest("button"))) {
      suppressClickRef.current = false;
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width || 1000;
    const height = rect.height || 760;
    const point = viewportPointToPercent({ x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport, width, height);
    const geo = mapPercentToGeo(Math.max(0, Math.min(100, point.xPct)), Math.max(0, Math.min(100, point.yPct)));
    placeIncident(geo.latitude, geo.longitude);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, viewport, moved: false };
    suppressClickRef.current = false;
    setIsDragging(false);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) < 6) return;
    drag.moved = true;
    suppressClickRef.current = true;
    setIsDragging(true);
    setViewport(panViewport(drag.viewport, (dx / (event.currentTarget.clientWidth || 1000)) * 100, (dy / (event.currentTarget.clientHeight || 760)) * 100));
  }

  function handlePointerUp() {
    dragRef.current = null;
    setIsDragging(false);
  }

  function handleToolbarKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, action: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }

  function stopMapEvent(event: React.SyntheticEvent) {
    event.stopPropagation();
  }

  const mapTransform = `translate(${viewport.offsetX}% ${viewport.offsetY}%) scale(${viewport.scale})`;

  function renderLayerButton(layer: LayerId, label: string) {
    const visible = Boolean(layers[layer]);
    return <button key={layer} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()} layer`} onClick={(event) => { stopMapEvent(event); toggleLayer(layer); }} onKeyDown={(event) => handleToolbarKeyDown(event, () => toggleLayer(layer))}>{visible ? "●" : "○"} {label}</button>;
  }

  function handleZoom(factor: number) {
    setViewport((current) => zoomViewport(current, factor));
  }

  function handleReset() {
    setViewport(resetViewport());
  }

  return (
    <div className="map-stage" onClick={handleMapClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} data-dragging={String(isDragging)} data-map-scale={viewport.scale} role="application" aria-label="Ottawa forecast map. Click to place the incident location.">
      <svg className="map-svg" style={{ transform: mapTransform, transformOrigin: "50% 50%" }} viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="map-glow"><feGaussianBlur stdDeviation="8" /></filter>
          <pattern id="city-grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M0 0 L70 70 M70 0 L0 70" stroke="#1f3544" strokeWidth="1" opacity="0.32" /></pattern>
        </defs>
        <rect width="1000" height="760" fill="#0a1721" />
        <rect width="1000" height="760" fill="url(#city-grid)" opacity="0.46" />
        <path d="M-10 188 C 210 220 276 98 420 148 S 690 160 1014 96" fill="none" stroke="#17384a" strokeWidth="48" opacity="0.95" />
        <path d="M-10 188 C 210 220 276 98 420 148 S 690 160 1014 96" fill="none" stroke="#3c7785" strokeWidth="1.3" opacity="0.65" />
        <g fill="none" stroke="#284151" strokeWidth="3" opacity="0.72">
          <path d="M30 650 C 220 550 290 520 430 438 S 760 340 1000 360" /><path d="M50 90 C 190 180 290 250 386 372 S 650 610 930 740" /><path d="M150 750 C 298 590 360 492 478 360 S 720 164 836 4" /><path d="M20 438 C 230 382 388 364 585 382 S 820 432 994 520" />
        </g>
        <g fill="none" stroke="#5b7180" strokeWidth="1" opacity="0.52"><path d="M80 170 L180 610" /><path d="M280 80 L440 720" /><path d="M450 50 L670 700" /><path d="M640 60 L820 730" /><path d="M810 40 L930 630" /><path d="M70 292 C260 260 480 260 920 290" /><path d="M48 555 C320 495 620 540 968 588" /></g>
        <g fontFamily="ui-monospace, monospace" fill="#6f8a99" fontSize="15" letterSpacing="2"><text x="502" y="108">OTTAWA RIVER</text><text x="472" y="271" fill="#9caeb7" fontSize="20">OTTAWA</text><text x="366" y="333">BYWARD MARKET</text><text x="630" y="525">THE GLEBE</text><text x="760" y="325">VANIER</text><text x="176" y="463">HULL</text><text x="310" y="585">NEPEAN</text><text x="614" y="458">CENTRETOWN</text></g>
        <RiskZoneLayer centerX={markerX} centerY={markerY} minutes={minutes} visible={Boolean(layers.plume && forecast.status !== "idle")} />
        <PlumeLayer minutes={minutes} visible={plumeVisible} uncertaintyVisible={layers.uncertainty} />
        {layers.infrastructure && infrastructure.map((feature) => <g key={feature.id} transform={`translate(${feature.x * 10},${feature.y * 7.5})`} aria-label={`${feature.name}, ${feature.zone} risk zone`}><circle r="18" fill="#06131c" stroke="#7eb8cd" strokeWidth="2" /><foreignObject x="-11" y="-11" width="22" height="22"><InfrastructureGlyph type={feature.type} /></foreignObject></g>)}
        <g transform={`translate(${markerX} ${markerY})`} aria-label={`Incident source at ${incident.latitude}, ${incident.longitude}`}><circle r="30" fill="#ff3d4e" opacity="0.12" filter="url(#map-glow)" /><path d="M0 -22 C -18 -22 -25 -8 -25 5 C -25 22 0 42 0 42 S 25 22 25 5 C 25 -8 18 -22 0 -22Z" fill="#ff4a4e" stroke="#ffe0d7" strokeWidth="2" /><circle cy="5" r="8" fill="#07131c" /><rect x="-35" y="48" width="160" height="45" rx="5" fill="#091821" stroke="#f24b51" /><text x="-23" y="66" fill="#ff5657" fontFamily="ui-monospace, monospace" fontSize="12" fontWeight="700">SOURCE</text><text x="-23" y="83" fill="#f4f8f8" fontFamily="ui-monospace, monospace" fontSize="11">Industrial Facility</text></g>
        <g transform="translate(26 30)"><rect width="46" height="48" rx="4" fill="#0a1b27" stroke="#8396a1" /><path d="M23 8 L16 25 L23 22 L30 25Z" fill="#f1f5f6" /><text x="18" y="39" fill="#b9c5c8" fontSize="12" fontFamily="ui-monospace, monospace">N</text></g>
        <g transform="translate(925 616)"><rect width="48" height="112" rx="5" fill="#081722" stroke="#4b6674" /><path d="M24 10v19M15 19h18M24 78v22M15 89h18" stroke="#dae5e6" strokeWidth="2" /><text x="17" y="62" fill="#d7e3e5" fontSize="22">+</text><text x="17" y="104" fill="#d7e3e5" fontSize="22">−</text></g>
        <g transform="translate(20 704)"><rect width="158" height="32" rx="3" fill="#07131c" stroke="#4a6977" /><path d="M18 717h102M18 712v10M69 712v10M120 712v10" stroke="#f4f8f8" strokeWidth="2" /><text x="128" y="725" fill="#c6d6da" fontFamily="ui-monospace, monospace" fontSize="10">2 km</text></g>
      </svg>
      {layers.wind && <WindIndicator direction={weather.windDirection} speed={weather.windSpeedKmh} />}
      <div className="map-annotation map-annotation--uncertainty">{layers.uncertainty ? "FORECAST UNCERTAINTY" : "UNCERTAINTY HIDDEN"}</div>
      <div className="map-map-label">{forecast.status === "idle" ? "DEMO MAP · PLACE AN INCIDENT TO BEGIN" : `MODEL FRAME · ${minutes} MINUTES`}</div>
      <div className="map-toolbar" onPointerDown={stopMapEvent}><button aria-label="Recenter map" onClick={(event) => { stopMapEvent(event); handleReset(); }} onKeyDown={(event) => handleToolbarKeyDown(event, handleReset)}><Crosshair size={16} /></button><button aria-label="Zoom in" onClick={(event) => { stopMapEvent(event); handleZoom(1.25); }} onKeyDown={(event) => handleToolbarKeyDown(event, () => handleZoom(1.25))}><Plus size={16} /></button><button aria-label="Zoom out" onClick={(event) => { stopMapEvent(event); handleZoom(0.8); }} onKeyDown={(event) => handleToolbarKeyDown(event, () => handleZoom(0.8))}><Minus size={16} /></button><button aria-label="Toggle layers" aria-expanded={layersOpen} onClick={(event) => { stopMapEvent(event); setLayersOpen((open) => !open); }} onKeyDown={(event) => handleToolbarKeyDown(event, () => setLayersOpen((open) => !open))}><Layers3 size={16} /></button></div>
      {layersOpen && <div className="map-layer-popover" role="group" aria-label="Map layers" onPointerDown={stopMapEvent}>{renderLayerButton("plume", "Plume")}{renderLayerButton("uncertainty", "Uncertainty")}{renderLayerButton("infrastructure", "Infrastructure")}{renderLayerButton("wind", "Wind")}</div>}
    </div>
  );
}
