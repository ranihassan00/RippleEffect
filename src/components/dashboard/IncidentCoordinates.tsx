"use client";

import { useEffect, useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { parseCoordinateValue } from "@/lib/geo";

export function IncidentCoordinates() {
  const { scenario, setScenarioField } = useSimulation();
  const [latitude, setLatitude] = useState(String(scenario.incident.latitude));
  const [longitude, setLongitude] = useState(String(scenario.incident.longitude));
  const [errors, setErrors] = useState<{ latitude?: string; longitude?: string }>({});
  useEffect(() => { setLatitude(String(scenario.incident.latitude)); setLongitude(String(scenario.incident.longitude)); }, [scenario.incident.latitude, scenario.incident.longitude]);
  function commit(axis: "latitude" | "longitude") {
    const text = axis === "latitude" ? latitude : longitude;
    const value = parseCoordinateValue(text, axis);
    if (value === null) { setErrors((current) => ({ ...current, [axis]: axis === "latitude" ? "Use -90 to 90." : "Use -180 to 180." })); return; }
    setErrors((current) => ({ ...current, [axis]: undefined }));
    setScenarioField(`incident.${axis}`, value);
  }
  return <div className="field-grid coordinate-fields"><label className="field-label">Latitude<input aria-label="Incident latitude" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} onBlur={() => commit("latitude")} onKeyDown={(event) => { if (event.key === "Enter") commit("latitude"); }} aria-invalid={Boolean(errors.latitude)} />{errors.latitude && <span className="field-error" role="alert">{errors.latitude}</span>}</label><label className="field-label">Longitude<input aria-label="Incident longitude" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} onBlur={() => commit("longitude")} onKeyDown={(event) => { if (event.key === "Enter") commit("longitude"); }} aria-invalid={Boolean(errors.longitude)} />{errors.longitude && <span className="field-error" role="alert">{errors.longitude}</span>}</label></div>;
}
