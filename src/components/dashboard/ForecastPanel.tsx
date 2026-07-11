"use client";

import { AlertTriangle, ChevronUp, Info } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { HAZARDS } from "@/lib/demo-data";
import { RISK_ZONES } from "@/lib/ui-data";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { RiskLegend } from "@/components/map/RiskLegend";

export function ForecastPanel() {
  const { incident, weather, forecast, currentFrame } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === incident.hazardId) ?? HAZARDS[0];
  return <Panel className="forecast-panel"><PanelHeading><span>FORECAST SUMMARY</span><ChevronUp size={15} /></PanelHeading>{forecast.status === "running" ? <div className="forecast-loading"><span className="loading-ring" /><strong>Running forecast</strong><span>Propagating local demo model…</span></div> : <><div className="current-forecast"><span>CURRENT {currentFrame?.minutes ?? 30} MIN</span><small>VALID {weather.timestamp}</small></div><div className="summary-rows"><div><span>Wind</span><strong>{weather.windSpeedKmh} km/h {weather.windDirection}</strong></div><div><span>Affected schools</span><strong>{currentFrame?.infrastructure.filter((item) => item.type === "school").length ?? 0} schools</strong></div><div><span>Affected hospitals</span><strong>{currentFrame?.infrastructure.filter((item) => item.type === "hospital").length ?? 0} hospital</strong></div><div><span>Model time</span><strong>{currentFrame?.minutes ?? "—"} min</strong></div><div><span>Confidence</span><strong className={`confidence-${currentFrame?.confidence?.toLowerCase() ?? "medium"}`}>{currentFrame?.confidence ?? "—"}</strong></div></div><div className="forecast-section"><div className="section-heading">RISK ZONES <Info size={14} /></div><RiskLegend />{currentFrame && <div className="zone-detail-list">{RISK_ZONES.map((zone) => <div key={zone.id}><span style={{ color: zone.color }}>{zone.name}</span><small>{zone.detail}</small></div>)}</div>}</div><div className="forecast-section model-notes"><div className="section-heading">MODEL NOTES <Info size={14} /></div><p>Dispersion influenced by wind, stability, and terrain. Uncertainty increases with distance and time.</p>{hazard.modelWarning && <div className="warning-box"><AlertTriangle size={15} /><span>{hazard.modelWarning}</span></div>}</div></>}</Panel>;
}
