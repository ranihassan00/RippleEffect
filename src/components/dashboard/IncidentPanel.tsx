"use client";

import { useState } from "react";
import { ChevronDown, Factory, ShieldAlert } from "lucide-react";
import { HAZARDS } from "@/lib/demo-data";
import { useSimulation } from "@/hooks/useSimulation";
import { IncidentCoordinates } from "@/components/dashboard/IncidentCoordinates";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { HazardSelector } from "@/components/dashboard/HazardSelector";

function ErrorText({ message, id }: { message?: string; id: string }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

export function IncidentPanel() {
  const { scenario, validationErrors, setScenarioField } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(true);
  const hazard = HAZARDS.find((item) => item.id === scenario.hazardId) ?? HAZARDS[0];
  const error = (field: string) => validationErrors[field];

  return (
    <Panel className="rail-panel incident-panel">
      <PanelHeading>
        <button
          className="panel-heading-toggle"
          type="button"
          aria-expanded={isExpanded}
          aria-controls="incident-configuration-content"
          aria-label={isExpanded ? "Collapse Incident Configuration" : "Expand Incident Configuration"}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span>INCIDENT CONFIGURATION</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </PanelHeading>
      <div id="incident-configuration-content" hidden={!isExpanded}>
        <div className="panel-section">
          <div className="section-kicker">INCIDENT DETAILS</div>
          <label className="field-label">Incident name<input aria-label="Incident name" maxLength={80} value={scenario.incident.name} onChange={(event) => setScenarioField("incident.name", event.target.value)} aria-invalid={Boolean(error("incident.name"))} aria-describedby={error("incident.name") ? "incident-name-error" : undefined} /><ErrorText id="incident-name-error" message={error("incident.name")} /></label>
          <label className="field-label">Location<input aria-label="Incident location" maxLength={120} value={scenario.incident.location} onChange={(event) => setScenarioField("incident.location", event.target.value)} aria-invalid={Boolean(error("incident.location"))} /><ErrorText id="incident-location-error" message={error("incident.location")} /></label>
          <div className="field-grid"><label className="field-label">Date<input aria-label="Incident date" type="date" value={scenario.incident.date} onChange={(event) => setScenarioField("incident.date", event.target.value)} aria-invalid={Boolean(error("incident.date"))} /></label><label className="field-label">Time<input aria-label="Incident time" type="time" value={scenario.incident.time} onChange={(event) => setScenarioField("incident.time", event.target.value)} aria-invalid={Boolean(error("incident.time"))} /></label></div>
          <IncidentCoordinates />
          <label className="field-label">Operational note<textarea className="operational-note" aria-label="Operational note" rows={2} maxLength={240} value={scenario.incident.description} onChange={(event) => setScenarioField("incident.description", event.target.value)} /></label>
        </div>
        <div className="panel-section"><div className="section-kicker">SOURCE</div><div className="source-row"><Factory size={17} /><div><strong>{scenario.incident.incidentType}</strong><span>{scenario.incident.location}</span><span>LOCAL MAP PLACEMENT</span></div></div></div>
        <div className="panel-section"><div className="section-kicker">HAZARD PROFILE</div><HazardSelector /><div className={`density-note density-note--${hazard.densityClass}`}><ShieldAlert size={14} /><span>{hazard.densityClass === "dense" ? "DENSE GAS LIMITATION" : `${hazard.densityClass.toUpperCase()} RELEASE`}</span></div>{hazard.modelWarning && <p className="model-warning">{hazard.modelWarning}</p>}</div>
      </div>
    </Panel>
  );
}
