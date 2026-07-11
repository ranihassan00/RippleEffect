"use client";

import { ChevronDown, Factory, ShieldAlert } from "lucide-react";
import { HAZARDS, INCIDENT_TYPES } from "@/lib/demo-data";
import { useSimulation } from "@/hooks/useSimulation";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";

export function IncidentPanel() {
  const { incident, setIncidentField } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === incident.hazardId) ?? HAZARDS[0];
  return <Panel className="rail-panel incident-panel">
    <PanelHeading><span>INCIDENT</span><ChevronDown size={15} /></PanelHeading>
    <div className="panel-section"><div className="section-kicker">SOURCE</div><div className="source-row"><Factory size={17} /><div><strong>Industrial Facility</strong><span>1234 Michael St.</span><span>Ottawa, ON</span></div></div></div>
    <div className="panel-section"><div className="section-kicker">HAZARD</div><Select aria-label="Select hazard" value={hazard.id} onChange={(event) => setIncidentField("hazardId", event.target.value)}>{HAZARDS.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.formula})</option>)}</Select><div className={`density-note density-note--${hazard.densityClass}`}><ShieldAlert size={14} /><span>{hazard.densityClass === "dense" ? "DENSE GAS" : `${hazard.densityClass.toUpperCase()} RELEASE`}</span></div></div>
    <div className="panel-section"><div className="section-kicker">RELEASE DETAILS</div><label className="field-label">Incident type<Select aria-label="Select incident type" value={incident.incidentType} onChange={(event) => setIncidentField("incidentType", event.target.value)}>{INCIDENT_TYPES.map((item) => <option key={item}>{item}</option>)}</Select></label><div className="field-grid"><label className="field-label">Rate<input aria-label="Release rate" type="number" min="0.1" step="0.1" value={incident.releaseRateKgS} onChange={(event) => setIncidentField("releaseRateKgS", Number(event.target.value))} /><span className="field-unit">kg/s</span></label><label className="field-label">Height<input aria-label="Source height" type="number" min="1" value={incident.sourceHeightM} onChange={(event) => setIncidentField("sourceHeightM", Number(event.target.value))} /><span className="field-unit">m</span></label></div><label className="field-label">Release duration<div className="range-row"><Slider aria-label="Release duration" min="5" max="120" step="5" value={incident.durationMinutes} onChange={(event) => setIncidentField("durationMinutes", Number(event.target.value))} /><output>{incident.durationMinutes} min</output></div></label></div>
  </Panel>;
}
