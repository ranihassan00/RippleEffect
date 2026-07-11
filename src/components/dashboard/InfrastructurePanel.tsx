"use client";

import { Building2, GraduationCap, Hospital, Route, Train } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Panel, PanelHeading } from "@/components/ui/Panel";

import type { InfrastructureType } from "@/lib/types";
const icons: Record<InfrastructureType, typeof Building2> = {
  school: GraduationCap,
  hospital: Hospital,
  road: Route,
  transit: Train,
  "fire-station": Building2
};

export function InfrastructurePanel() {
  const { forecast, metrics } = useSimulation();
  const items = metrics.infrastructure;
  return <Panel className="rail-panel infrastructure-panel"><PanelHeading><span>INFRASTRUCTURE SUMMARY</span><span className="panel-count">{items.length}</span></PanelHeading><p className="panel-subtitle">SIMULATED IMPACT · {items.filter((item) => item.status === "High" || item.status === "Critical").length} AT RISK</p><div className="infra-list">{items.slice(0, 6).map((item) => { const Icon = icons[item.type]; return <div className="infra-row" key={item.id}><span className="infra-icon"><Icon size={14} /></span><div><strong>{item.shortLabel}</strong><span>{item.name}</span><small>{item.distanceKm} km · arrival {item.impactMinutes} min</small></div><span className={"infra-status infra-status--" + item.status.toLowerCase()}>{item.status}</span></div>; })}</div>{forecast.status === "idle" && <p className="muted-copy">Run forecast to commit the current simulated frame.</p>}</Panel>;
}
