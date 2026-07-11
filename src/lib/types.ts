export type HazardCategory = "gas" | "vapour" | "smoke" | "particulate" | "unknown";
export type DensityClass = "buoyant" | "neutral" | "dense";
export type RiskZoneId = "monitoring" | "advisory" | "shelter" | "evacuation" | "severe";
export type InfrastructureType = "school" | "hospital" | "road" | "transit" | "fire-station";
export type LayerId = "plume" | "uncertainty" | "infrastructure" | "wind";

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
