"use client";

import { ChevronDown, Factory, ShieldAlert } from "lucide-react";
import { HAZARDS, INCIDENT_TYPES } from "@/lib/demo-data";
import { useSimulation } from "@/hooks/useSimulation";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { HazardSelector } from "@/components/dashboard/HazardSelector";

function ErrorText({ message, id }: { message?: string; id: string }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

export function IncidentPanel() {
  const { scenario, validationErrors, setScenarioField } = useSimulation();
  const hazard = HAZARDS.find((item) => item.id === scenario.hazardId) ?? HAZARDS[0];
  const error = (field: string) => validationErrors[field];
  return <Panel className="rail-panel incident-panel">
    <PanelHeading><span>INCIDENT CONFIGURATION</span><ChevronDown size={15} /></PanelHeading>
    <div className="panel-section">
      <div className="section-kicker">INCIDENT DETAILS</div>
      <label className="field-label">Incident name<input aria-label="Incident name" maxLength={80} value={scenario.incident.name} onChange={(event) => setScenarioField("incident.name", event.target.value)} aria-invalid={Boolean(error("incident.name"))} aria-describedby={error("incident.name") ? "incident-name-error" : undefined} /><ErrorText id="incident-name-error" message={error("incident.name")} /></label>
      <label className="field-label">Location<input aria-label="Incident location" maxLength={120} value={scenario.incident.location} onChange={(event) => setScenarioField("incident.location", event.target.value)} aria-invalid={Boolean(error("incident.location"))} /><ErrorText id="incident-location-error" message={error("incident.location")} /></label>
      <div className="field-grid"><label className="field-label">Date<input aria-label="Incident date" type="date" value={scenario.incident.date} onChange={(event) => setScenarioField("incident.date", event.target.value)} aria-invalid={Boolean(error("incident.date"))} /></label><label className="field-label">Time<input aria-label="Incident time" type="time" value={scenario.incident.time} onChange={(event) => setScenarioField("incident.time", event.target.value)} aria-invalid={Boolean(error("incident.time"))} /></label></div>
      <label className="field-label">Operational note<textarea className="operational-note" aria-label="Operational note" rows={2} maxLength={240} value={scenario.incident.description} onChange={(event) => setScenarioField("incident.description", event.target.value)} /></label>
    </div>
    <div className="panel-section"><div className="section-kicker">SOURCE</div><div className="source-row"><Factory size={17} /><div><strong>{scenario.incident.incidentType}</strong><span>{scenario.incident.location}</span><span>LOCAL MAP PLACEMENT</span></div></div></div>
    <div className="panel-section"><div className="section-kicker">HAZARD PROFILE</div><HazardSelector /><div className={`density-note density-note--${hazard.densityClass}`}><ShieldAlert size={14} /><span>{hazard.densityClass === "dense" ? "DENSE GAS LIMITATION" : `${hazard.densityClass.toUpperCase()} RELEASE`}</span></div>{hazard.modelWarning && <p className="model-warning">{hazard.modelWarning}</p>}</div>
    <div className="panel-section"><div className="section-kicker">RELEASE PARAMETERS</div><label className="field-label">Incident type<Select aria-label="Select incident type" value={scenario.incident.incidentType} onChange={(event) => setScenarioField("incident.incidentType", event.target.value)}>{INCIDENT_TYPES.map((item) => <option value={item} key={item}>{item}</option>)}</Select></label><div className="field-grid"><label className="field-label">Rate<input aria-label="Release rate" type="number" min="0.1" max="100" step="0.1" value={scenario.release.rateKgS} onChange={(event) => setScenarioField("release.rateKgS", Number(event.target.value))} /><span className="field-unit">kg/s</span><ErrorText id="rate-error" message={error("release.rateKgS")} /></label><label className="field-label">Height<input aria-label="Source height" type="number" min="0" max="100" step="1" value={scenario.release.sourceHeightM} onChange={(event) => setScenarioField("release.sourceHeightM", Number(event.target.value))} /><span className="field-unit">m</span></label></div><label className="field-label">Release duration<div className="range-row"><Slider aria-label="Release duration" min="1" max="240" step="1" value={scenario.release.durationMinutes} onChange={(event) => setScenarioField("release.durationMinutes", Number(event.target.value))} /><output>{scenario.release.durationMinutes} min</output></div></label><label className="field-label">Containment<div className="range-row"><Slider aria-label="Containment percentage" min="0" max="100" step="5" value={scenario.release.containmentPercent} onChange={(event) => setScenarioField("release.containmentPercent", Number(event.target.value))} /><output>{scenario.release.containmentPercent}%</output></div></label><label className="field-label">Severity<select aria-label="Incident severity" value={scenario.severity} onChange={(event) => setScenarioField("severity", Number(event.target.value))}>{[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>{level} / 5</option>)}</select></label></div>
  </Panel>;
}
