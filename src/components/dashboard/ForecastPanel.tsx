"use client";

import { AlertTriangle, ChevronUp, Info } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { HAZARDS } from "@/lib/demo-data";
import { RISK_ZONES } from "@/lib/ui-data";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { RiskLegend } from "@/components/map/RiskLegend";

export function ForecastPanel() {
  const { scenario, weather, forecast, currentFrame, metrics } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === scenario.hazardId) ?? HAZARDS[0];
  const confidence = currentFrame?.confidence ?? metrics.confidence;
  return <Panel className="forecast-panel"><PanelHeading><span>FORECAST SUMMARY</span><span className="simulated-badge">DEMO MODEL</span><ChevronUp size={15} /></PanelHeading>{forecast.status === "running" ? <div className="forecast-loading"><span className="loading-ring" /><strong>Running simulated forecast</strong><span>Propagating local demo model…</span></div> : <><div className="current-forecast"><span>{metrics.status}</span><small>VALID {weather.timestamp} · SIMULATED</small></div><div className="summary-rows"><div><span>Affected area</span><strong>{metrics.affectedAreaKm2} km²</strong></div><div><span>Downwind distance</span><strong>{metrics.downwindDistanceKm} km</strong></div><div><span>Population exposure</span><strong>{metrics.populationAffected.toLocaleString()}</strong></div><div><span>Estimated arrival</span><strong>{metrics.estimatedArrivalMinutes} min</strong></div><div><span>Current frame</span><strong>{currentFrame?.minutes ?? 30} min</strong></div><div><span>Confidence</span><strong className={"confidence-" + confidence.toLowerCase()}>{confidence}</strong></div></div><div className="forecast-section"><div className="section-heading">RISK ZONES <Info size={14} /></div><RiskLegend />{currentFrame && <div className="zone-detail-list">{RISK_ZONES.map((zone) => <div key={zone.id}><span style={{ color: zone.color }}>{zone.name}</span><small>{zone.detail}</small></div>)}</div>}</div><div className="forecast-section model-notes"><div className="section-heading">MODEL NOTES <Info size={14} /></div><p>Higher wind increases downwind distance. Release, duration, containment, and stability influence this deterministic demo estimate.</p>{hazard.modelWarning && <div className="warning-box"><AlertTriangle size={15} /><span>{hazard.modelWarning}</span></div>}</div></>}</Panel>;
}
