"use client";

import { AlertOctagon, Gauge, Users, Waves, Zap, Building2 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Panel, PanelHeading } from "@/components/ui/Panel";

const icons = { population: Users, infrastructure: Building2, environment: Waves, urgency: Zap, overall: AlertOctagon };

export function RiskPanel() {
  const { metrics } = useSimulation();
  return <Panel className="rail-panel risk-panel"><PanelHeading><span>RISK SUMMARY</span><Gauge size={15} /></PanelHeading><div className="risk-list">{metrics.risks.map((risk) => { const Icon = icons[risk.id]; return <div className={"risk-card risk-card--" + risk.level.toLowerCase()} key={risk.id}><div className="risk-card-heading"><Icon size={14} /><strong>{risk.label}</strong><span>{risk.level}</span></div><div className="risk-score"><span className="risk-score-bar"><i style={{ width: risk.score + "%" }} /></span><strong>{risk.score}</strong></div><p>{risk.explanation}</p></div>; })}</div></Panel>;
}
