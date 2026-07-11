"use client";

import { useState } from "react";

import { Activity, AlertTriangle, ChevronDown, Settings2 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { HAZARDS } from "@/lib/demo-data";
import { Button } from "@/components/ui/Button";
import { IncidentMap } from "@/components/map/IncidentMap";
import { IncidentPanel } from "@/components/dashboard/IncidentPanel";
import { WeatherPanel } from "@/components/dashboard/WeatherPanel";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import { InfrastructurePanel } from "@/components/dashboard/InfrastructurePanel";
import { SimulationControls } from "@/components/dashboard/SimulationControls";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { ForecastTimeline } from "@/components/timeline/ForecastTimeline";
import type { LayerId } from "@/lib/types";

const displayLayers: ReadonlyArray<readonly [LayerId, string]> = [
  ["plume", "Probable impact zone"],
  ["uncertainty", "Forecast uncertainty"],
  ["infrastructure", "Critical infrastructure"],
  ["wind", "Wind vector"]
] as const;

export default function DashboardPage() {
  const { incident, forecast, runForecast, layers, toggleLayer } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === incident.hazardId) ?? HAZARDS[0];
  const [layersExpanded, setLayersExpanded] = useState(true);

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark"><Activity size={26} /></div><div><strong>RIPPLE EFFECT</strong><span>AIRBORNE-HAZARD INTELLIGENCE</span></div></div>
      <div className="incident-headline"><AlertTriangle size={20} /><span>{incident.title.toUpperCase()}</span><small>· {hazard.formula}</small></div>
      <div className="topbar-actions"><div className="model-time"><span>MAY 26, 2025&nbsp;&nbsp;09:42</span><small>MODEL UPDATED&nbsp; 09:42</small></div><Button variant="primary" onClick={runForecast} disabled={forecast.status === "running"}><span className="button-play">▶</span>{forecast.status === "running" ? " RUNNING" : " RUN FORECAST"}</Button><Button variant="icon" aria-label="Open settings"><Settings2 size={17} /></Button></div>
    </header>
    <div className="workspace-grid">
      <aside className="left-rail"><IncidentPanel /><WeatherPanel /><SimulationControls /><div className="layer-panel panel">
  <div className="panel-heading">
    <button className="panel-heading-toggle" type="button" aria-expanded={layersExpanded} aria-controls="display-layers-content" aria-label={layersExpanded ? "Collapse Display Layers" : "Expand Display Layers"} onClick={() => setLayersExpanded((expanded) => !expanded)}>
      <span>DISPLAY LAYERS</span>
      <ChevronDown size={15} aria-hidden="true" />
    </button>
  </div>
  <div id="display-layers-content" hidden={!layersExpanded}>
    {displayLayers.map(([layer, label]) => <label className="check-row" key={layer}><input type="checkbox" aria-label={label} checked={Boolean(layers[layer])} onChange={() => toggleLayer(layer)} /><span>{label}</span></label>)}
    <p className="estimate-note">Estimated dispersion — decision-support estimate.</p>
  </div>
</div></aside>
      <section className="map-column"><IncidentMap /><div className="map-footer-meta"><span>MAPBOX / OTTAWA DEMO BASEMAP</span><span>GRID RESOLUTION 250 m</span><span>SIMULATION v0.1.0 · UI DEMO</span></div></section>
      <aside className="right-rail"><ForecastPanel /><InfrastructurePanel /><RiskPanel /></aside>
    </div>
    <ForecastTimeline />
  </main>;
}
