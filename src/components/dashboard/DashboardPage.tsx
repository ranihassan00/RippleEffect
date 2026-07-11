"use client";

import { Activity, AlertTriangle, ChevronDown, Settings2 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { HAZARDS } from "@/lib/demo-data";
import { Button } from "@/components/ui/Button";
import { IncidentMap } from "@/components/map/IncidentMap";
import { IncidentPanel } from "@/components/dashboard/IncidentPanel";
import { WeatherPanel } from "@/components/dashboard/WeatherPanel";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import { InfrastructurePanel } from "@/components/dashboard/InfrastructurePanel";
import { ForecastTimeline } from "@/components/timeline/ForecastTimeline";

export default function DashboardPage() {
  const { incident, forecast, runForecast } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === incident.hazardId) ?? HAZARDS[0];
  return <main className="app-shell"><header className="topbar"><div className="brand-lockup"><div className="brand-mark"><Activity size={26} /></div><div><strong>RIPPLE EFFECT</strong><span>AIRBORNE-HAZARD INTELLIGENCE</span></div></div><div className="incident-headline"><AlertTriangle size={20} /><span>{incident.title.toUpperCase()}</span><small>· {hazard.formula}</small></div><div className="topbar-actions"><div className="model-time"><span>MAY 26, 2025&nbsp;&nbsp;09:42</span><small>MODEL UPDATED&nbsp; 09:42</small></div><Button variant="primary" onClick={runForecast} disabled={forecast.status === "running"}><span className="button-play">▶</span>{forecast.status === "running" ? " RUNNING" : " RUN FORECAST"}</Button><Button variant="icon" aria-label="Open settings"><Settings2 size={17} /></Button></div></header><div className="workspace-grid"><aside className="left-rail"><IncidentPanel /><WeatherPanel /><div className="layer-panel panel"><div className="panel-heading"><span>DISPLAY LAYERS</span><ChevronDown size={15} /></div>{["plume", "uncertainty", "infrastructure", "wind"].map((layer) => <label className="check-row" key={layer}><input type="checkbox" checked={true} readOnly /><span>{layer === "plume" ? "Probable impact zone" : layer === "uncertainty" ? "Forecast uncertainty" : layer === "infrastructure" ? "Critical infrastructure" : "Wind vector"}</span></label>)}<p className="estimate-note">Estimated dispersion — decision-support estimate.</p></div></aside><section className="map-column"><IncidentMap /><div className="map-footer-meta"><span>MAPBOX / OTTAWA DEMO BASEMAP</span><span>GRID RESOLUTION 250 m</span><span>SIMULATION v0.1.0 · UI DEMO</span></div></section><aside className="right-rail"><ForecastPanel /><InfrastructurePanel /></aside></div><ForecastTimeline /><footer className="disclaimer"><span>PROTOTYPE DECISION-SUPPORT SYSTEM</span><span>Forecasts are simplified probabilistic estimates and must not replace validated emergency-response procedures or trained authority decisions.</span></footer></main>;
}
