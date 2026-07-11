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
  const { currentFrame, forecast } = useSimulation();
  const items = currentFrame?.infrastructure ?? [];
  return <Panel className="rail-panel infrastructure-panel"><PanelHeading><span>INFRASTRUCTURE AT RISK</span><span className="panel-count">{forecast.status === "ready" ? items.length : "—"}</span></PanelHeading>{forecast.status === "idle" ? <p className="muted-copy">Run a forecast to identify critical infrastructure inside the probable impact zones.</p> : <div className="infra-list">{items.slice(0, 4).map((item) => { const Icon = icons[item.type]; return <div className="infra-row" key={item.id}><span className="infra-icon"><Icon size={14} /></span><div><strong>{item.shortLabel}</strong><span>{item.name}</span></div><span className="infra-zone-dot" /></div>; })}</div>}</Panel>;
}
