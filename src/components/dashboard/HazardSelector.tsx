"use client";

import { Flame, ShieldAlert, Wind } from "lucide-react";
import { HAZARDS } from "@/lib/demo-data";
import { useSimulation } from "@/hooks/useSimulation";

const icons = { gas: ShieldAlert, vapour: Wind, smoke: Flame, particulate: Flame, unknown: ShieldAlert } as const;

export function HazardSelector() {
  const { scenario, setScenarioField } = useSimulation();
  return <div className="hazard-options" role="radiogroup" aria-label="Hazard type">
    {HAZARDS.map((hazard) => {
      const Icon = icons[hazard.category];
      return <label className={`hazard-option ${scenario.hazardId === hazard.id ? "is-selected" : ""}`} key={hazard.id}>
        <input type="radio" name="hazard" value={hazard.id} checked={scenario.hazardId === hazard.id} onChange={() => setScenarioField("hazardId", hazard.id)} />
        <span className="hazard-option-icon" style={{ color: hazard.color }}><Icon size={15} /></span>
        <span className="hazard-option-copy"><strong>{hazard.name}</strong><small>{hazard.formula} · {hazard.densityClass}</small></span>
        <span className="hazard-option-indicator" aria-hidden="true" />
      </label>;
    })}
  </div>;
}
