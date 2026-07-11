import type { HazardProfile, InfrastructureFeature, IncidentScenario } from "@/lib/types";

export const HAZARDS: HazardProfile[] = [
  { id: "ammonia", name: "Ammonia", formula: "NH₃", category: "gas", densityClass: "dense", unit: "ppm", color: "#ff6a3d", modelWarning: "Dense gas: near-source behavior may not be represented by a standard Gaussian model." },
  { id: "chlorine", name: "Chlorine", formula: "Cl₂", category: "gas", densityClass: "dense", unit: "ppm", color: "#ff3d71", modelWarning: "Dense gas: near-source behavior may not be represented by a standard Gaussian model." },
  { id: "smoke", name: "Smoke", formula: "PM₂.₅", category: "particulate", densityClass: "buoyant", unit: "µg/m³", color: "#ffad3d" },
  { id: "hydrogen-sulfide", name: "Hydrogen sulfide", formula: "H₂S", category: "gas", densityClass: "dense", unit: "ppm", color: "#cc3dff", modelWarning: "Dense gas: near-source behavior may not be represented by a standard Gaussian model." },
  { id: "sulfur-dioxide", name: "Sulfur dioxide", formula: "SO₂", category: "gas", densityClass: "neutral", unit: "ppm", color: "#e4d743" },
  { id: "unknown", name: "Unknown gas", formula: "UNK", category: "unknown", densityClass: "neutral", unit: "mg/m³", color: "#39c6ff" }
];

export const INCIDENT_TYPES = ["Factory leak", "Warehouse fire", "Rail incident", "Tanker collision", "Pipeline failure"];

export const DEMO_INFRASTRUCTURE: InfrastructureFeature[] = [
  { id: "school-1", type: "school", name: "École élémentaire du Nouveau Monde", shortLabel: "2 schools", x: 63, y: 38, zone: "evacuation" },
  { id: "school-2", type: "school", name: "Centretown Public School", shortLabel: "School", x: 51, y: 48, zone: "shelter" },
  { id: "hospital-1", type: "hospital", name: "The Ottawa Hospital", shortLabel: "1 hospital", x: 72, y: 47, zone: "evacuation" },
  { id: "transit-1", type: "transit", name: "Bayview Transit Station", shortLabel: "Transit", x: 37, y: 69, zone: "advisory" },
  { id: "road-1", type: "road", name: "Bronson Avenue arterial", shortLabel: "Arterial", x: 58, y: 70, zone: "advisory" },
  { id: "fire-1", type: "fire-station", name: "Station 14", shortLabel: "Fire station", x: 75, y: 21, zone: "monitoring" }
];

export const DEFAULT_WEATHER = {
  windSpeedKmh: 12,
  windDirection: "WNW",
  temperatureC: 12,
  humidityPct: 68,
  stability: "D (Neutral)",
  timestamp: "09:42",
  source: "Demo weather" as const
};

export const DEFAULT_SCENARIO: IncidentScenario = {
  incident: {
    name: "Factory ammonia leak",
    title: "Factory ammonia leak",
    incidentType: "Factory leak",
    location: "1234 Michael St., Ottawa, ON",
    latitude: 45.4215,
    longitude: -75.6972,
    date: "2025-05-26",
    time: "09:42",
    description: "Maintenance crew reported a sustained release near the north processing yard."
  },
  hazardId: "ammonia",
  severity: 4,
  weather: {
    temperatureC: 12,
    windSpeedKmh: 12,
    windDirection: "WNW",
    humidityPercent: 68,
    stability: "D",
    precipitationMm: 0,
    visibilityKm: 12
  },
  release: {
    rateKgS: 1.8,
    durationMinutes: 20,
    quantityKg: 2160,
    sourceHeightM: 5,
    containmentPercent: 15
  }
};
