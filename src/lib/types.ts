export type HazardCategory = "gas" | "vapour" | "smoke" | "particulate" | "unknown";
export type DensityClass = "buoyant" | "neutral" | "dense";
export type RiskZoneId = "monitoring" | "advisory" | "shelter" | "evacuation" | "severe";
export type InfrastructureType = "school" | "hospital" | "road" | "transit" | "fire-station";
export type LayerId = "plume" | "uncertainty" | "infrastructure" | "wind";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type StabilityClass = "A" | "B" | "C" | "D" | "E" | "F";

export interface HazardProfile {
  id: string;
  name: string;
  formula: string;
  category: HazardCategory;
  densityClass: DensityClass;
  unit: "ppm" | "mg/m³" | "µg/m³";
  color: string;
  modelWarning?: string;
}

export interface IncidentDraft {
  latitude: number;
  longitude: number;
  title: string;
  incidentType: string;
  hazardId: string;
  releaseRateKgS: number;
  durationMinutes: number;
  sourceHeightM: number;
  stability: "A" | "B" | "C" | "D" | "E" | "F";
  name?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
  quantityKg?: number;
  containmentPercent?: number;
}

export interface WeatherSnapshot {
  windSpeedKmh: number;
  windDirection: string;
  temperatureC: number;
  humidityPct: number;
  stability: string;
  timestamp: string;
  source: "Demo weather" | "Manual input";
}

export interface InfrastructureFeature {
  id: string;
  type: InfrastructureType;
  name: string;
  shortLabel: string;
  x: number;
  y: number;
  zone: RiskZoneId;
}

export interface ForecastFrame {
  minutes: number;
  plumeLengthKm: number;
  affectedAreaKm2: number;
  peakConcentration: number;
  confidence: "High" | "Medium" | "Low";
  uncertainty: "Low" | "Medium" | "High";
  infrastructure: InfrastructureFeature[];
  summary: string;
}

export interface ForecastState {
  frames: ForecastFrame[];
  currentMinutes: number;
  status: "idle" | "running" | "ready" | "error";
  lastRunAt?: string;
}

export interface ScenarioIncident {
  name: string;
  title: string;
  incidentType: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  description: string;
}

export interface ScenarioWeather {
  temperatureC: number;
  windSpeedKmh: number;
  windDirection: string;
  humidityPercent: number;
  stability: StabilityClass;
  precipitationMm: number;
  visibilityKm: number;
}

export interface ScenarioRelease {
  rateKgS: number;
  durationMinutes: number;
  quantityKg: number;
  sourceHeightM: number;
  containmentPercent: number;
}

export interface IncidentScenario {
  incident: ScenarioIncident;
  hazardId: string;
  severity: number;
  weather: ScenarioWeather;
  release: ScenarioRelease;
}

export interface ScenarioErrorMap {
  [field: string]: string;
}

export interface RiskSummary {
  id: "population" | "infrastructure" | "environment" | "urgency" | "overall";
  label: string;
  score: number;
  level: RiskLevel;
  explanation: string;
}

export interface ScenarioMetrics {
  affectedAreaKm2: number;
  downwindDistanceKm: number;
  populationAffected: number;
  estimatedArrivalMinutes: number;
  confidence: "High" | "Medium" | "Low";
  status: "MONITORING" | "ELEVATED" | "ACTIVE RESPONSE" | "CRITICAL";
  risks: RiskSummary[];
  infrastructure: Array<InfrastructureFeature & { distanceKm: number; status: RiskLevel; impactMinutes: number }>;
}
