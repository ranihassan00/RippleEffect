import { DEFAULT_SCENARIO as DEMO_SCENARIO, DEMO_INFRASTRUCTURE, HAZARDS } from "@/lib/demo-data";
import type { HazardProfile, IncidentScenario, RiskLevel, RiskSummary, ScenarioErrorMap, ScenarioMetrics, ScenarioIncident, ScenarioRelease, ScenarioWeather } from "@/lib/types";

export const SCENARIO_STORAGE_KEY = "ripple-effect:scenario:v1";
export const DEFAULT_SCENARIO = DEMO_SCENARIO;

const ranges = {
  rateKgS: [0.1, 100],
  durationMinutes: [1, 240],
  quantityKg: [0.1, 25000],
  sourceHeightM: [0, 100],
  containmentPercent: [0, 100],
  temperatureC: [-60, 60],
  windSpeedKmh: [0, 150],
  humidityPercent: [0, 100],
  precipitationMm: [0, 500],
  visibilityKm: [0.1, 100],
  severity: [1, 5]
} as const;

function inRange(value: unknown, range: readonly [number, number]) {
  return typeof value === "number" && Number.isFinite(value) && value >= range[0] && value <= range[1];
}

export function validateScenario(scenario: IncidentScenario): ScenarioErrorMap {
  const errors: ScenarioErrorMap = {};
  const { incident, release, weather } = scenario;
  if (!incident.name.trim()) errors["incident.name"] = "Incident name is required.";
  else if (incident.name.trim().length > 80) errors["incident.name"] = "Use 80 characters or fewer.";
  if (!incident.location.trim()) errors["incident.location"] = "Location is required.";
  if (!incident.date) errors["incident.date"] = "Date is required.";
  if (!incident.time) errors["incident.time"] = "Time is required.";
  if (!HAZARDS.some((hazard) => hazard.id === scenario.hazardId)) errors.hazardId = "Choose a supported hazard.";
  if (!inRange(scenario.severity, ranges.severity)) errors.severity = "Severity must be between 1 and 5.";
  if (!inRange(release.rateKgS, ranges.rateKgS)) errors["release.rateKgS"] = "Rate must be 0.1–100 kg/s.";
  if (!inRange(release.durationMinutes, ranges.durationMinutes)) errors["release.durationMinutes"] = "Duration must be 1–240 minutes.";
  if (!inRange(release.quantityKg, ranges.quantityKg)) errors["release.quantityKg"] = "Quantity must be 0.1–25,000 kg.";
  if (!inRange(release.sourceHeightM, ranges.sourceHeightM)) errors["release.sourceHeightM"] = "Height must be 0–100 m.";
  if (!inRange(release.containmentPercent, ranges.containmentPercent)) errors["release.containmentPercent"] = "Containment must be 0–100%.";
  if (!inRange(weather.temperatureC, ranges.temperatureC)) errors["weather.temperatureC"] = "Temperature is outside the supported range.";
  if (!inRange(weather.windSpeedKmh, ranges.windSpeedKmh)) errors["weather.windSpeedKmh"] = "Wind speed must be 0–150 km/h.";
  if (!inRange(weather.humidityPercent, ranges.humidityPercent)) errors["weather.humidityPercent"] = "Humidity must be 0–100%.";
  if (!inRange(weather.precipitationMm, ranges.precipitationMm)) errors["weather.precipitationMm"] = "Precipitation must be 0–500 mm.";
  if (!inRange(weather.visibilityKm, ranges.visibilityKm)) errors["weather.visibilityKm"] = "Visibility must be 0.1–100 km.";
  return errors;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 55) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hazardProfile(id: string): HazardProfile {
  return HAZARDS.find((hazard) => hazard.id === id) ?? HAZARDS[0];
}

export function calculateScenarioMetrics(scenario: IncidentScenario): ScenarioMetrics {
  const hazard = hazardProfile(scenario.hazardId);
  const { release, weather } = scenario;
  const hazardFactor = hazard.densityClass === "dense" ? 1.25 : hazard.category === "particulate" ? 1.1 : 1;
  const windFactor = Math.max(weather.windSpeedKmh, 2) / 12;
  const releaseFactor = release.rateKgS / 1.8;
  const durationFactor = Math.sqrt(release.durationMinutes / 20);
  const containmentFactor = 1 - release.containmentPercent / 125;
  const stabilityFactor = weather.stability === "F" || weather.stability === "E" ? 1.18 : weather.stability === "A" || weather.stability === "B" ? 0.88 : 1;
  const affectedAreaKm2 = Number(clamp(3.4 * releaseFactor * durationFactor * hazardFactor * containmentFactor * stabilityFactor, 0.1, 250).toFixed(1));
  const downwindDistanceKm = Number(clamp(2.7 * windFactor * durationFactor * hazardFactor * (1 + release.sourceHeightM / 90), 0.2, 80).toFixed(1));
  const populationAffected = Math.round(clamp(affectedAreaKm2 * 1650 * (1 + release.durationMinutes / 180), 10, 999999));
  const estimatedArrivalMinutes = Math.max(2, Math.round((1.2 / windFactor) * 10));
  const baseScore = clamp(24 + scenario.severity * 9 + releaseFactor * 13 + durationFactor * 9 + hazardFactor * 8 + weather.windSpeedKmh / 3 - release.containmentPercent * 0.22 + (weather.visibilityKm < 3 ? 10 : 0), 0, 100);
  const infra = DEMO_INFRASTRUCTURE.map((item, index) => {
    const distanceKm = Number((0.7 + index * 0.45).toFixed(1));
    const exposure = clamp(baseScore - index * 7 + (item.type === "hospital" || item.type === "school" ? 8 : 0), 0, 100);
    return { ...item, distanceKm, status: getRiskLevel(exposure), impactMinutes: Math.max(3, Math.round(estimatedArrivalMinutes + distanceKm / windFactor * 4)) };
  });
  const infrastructureScore = clamp(baseScore * 0.75 + infra.filter((item) => item.status === "High" || item.status === "Critical").length * 5, 0, 100);
  const risks: RiskSummary[] = [
    { id: "population", label: "Population exposure", score: Math.round(clamp(baseScore + affectedAreaKm2, 0, 100)), level: getRiskLevel(baseScore + affectedAreaKm2), explanation: `${populationAffected.toLocaleString()} people fall inside the simulated impact estimate.` },
    { id: "infrastructure", label: "Infrastructure disruption", score: Math.round(infrastructureScore), level: getRiskLevel(infrastructureScore), explanation: `${infra.filter((item) => item.status === "High" || item.status === "Critical").length} critical sites require monitoring.` },
    { id: "environment", label: "Environmental impact", score: Math.round(clamp(baseScore * 0.68 + hazardFactor * 8, 0, 100)), level: getRiskLevel(baseScore * 0.68 + hazardFactor * 8), explanation: `${affectedAreaKm2.toFixed(1)} km² is inside the simplified dispersion estimate.` },
    { id: "urgency", label: "Response urgency", score: Math.round(clamp(baseScore + (estimatedArrivalMinutes < 10 ? 12 : 0), 0, 100)), level: getRiskLevel(baseScore + (estimatedArrivalMinutes < 10 ? 12 : 0)), explanation: `Estimated arrival is ${estimatedArrivalMinutes} minutes downwind.` },
    { id: "overall", label: "Overall incident risk", score: Math.round(baseScore), level: getRiskLevel(baseScore), explanation: `Risk combines hazard, release, weather, containment, and nearby assets.` }
  ];
  return { affectedAreaKm2, downwindDistanceKm, populationAffected, estimatedArrivalMinutes, confidence: baseScore >= 70 ? "Low" : baseScore >= 45 ? "Medium" : "High", status: baseScore >= 80 ? "CRITICAL" : baseScore >= 60 ? "ACTIVE RESPONSE" : baseScore >= 35 ? "ELEVATED" : "MONITORING", risks, infrastructure: infra };
}

export function sanitizeScenario(value: unknown): IncidentScenario {
  if (!value || typeof value !== "object") return structuredClone(DEFAULT_SCENARIO);
  const input = value as Partial<IncidentScenario>;
  const incident = input.incident && typeof input.incident === "object" ? input.incident as Partial<ScenarioIncident> : {};
  const weather = input.weather && typeof input.weather === "object" ? input.weather as Partial<ScenarioWeather> : {};
  const release = input.release && typeof input.release === "object" ? input.release as Partial<ScenarioRelease> : {};
  const result: IncidentScenario = {
    incident: {
      ...DEFAULT_SCENARIO.incident,
      ...incident,
      name: typeof incident.name === "string" ? incident.name.slice(0, 80) : DEFAULT_SCENARIO.incident.name,
      location: typeof incident.location === "string" ? incident.location.slice(0, 120) : DEFAULT_SCENARIO.incident.location
    },
    hazardId: typeof input.hazardId === "string" && HAZARDS.some((hazard) => hazard.id === input.hazardId) ? input.hazardId : DEFAULT_SCENARIO.hazardId,
    severity: inRange(input.severity, ranges.severity) ? input.severity as number : DEFAULT_SCENARIO.severity,
    weather: { ...DEFAULT_SCENARIO.weather, ...weather },
    release: { ...DEFAULT_SCENARIO.release, ...release }
  };
  for (const key of Object.keys(DEFAULT_SCENARIO.weather) as Array<keyof typeof DEFAULT_SCENARIO.weather>) {
    const value = (result.weather as unknown as Record<string, unknown>)[key];
    const fallback = (DEFAULT_SCENARIO.weather as unknown as Record<string, unknown>)[key];
    if (typeof value !== typeof fallback) (result.weather as unknown as Record<string, unknown>)[key] = fallback;
  }
  for (const key of Object.keys(DEFAULT_SCENARIO.release) as Array<keyof typeof DEFAULT_SCENARIO.release>) {
    if (!inRange(result.release[key], ranges[key])) result.release[key] = DEFAULT_SCENARIO.release[key];
  }
  return result;
}
