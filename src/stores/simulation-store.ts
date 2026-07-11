"use client";

import { create } from "zustand";
import { buildForecastFrames, clampTimeline } from "@/lib/forecast";
import { DEFAULT_SCENARIO, SCENARIO_STORAGE_KEY, calculateScenarioMetrics, sanitizeScenario, validateScenario } from "@/lib/scenario";
import type { ForecastState, IncidentDraft, IncidentScenario, LayerId, ScenarioErrorMap, ScenarioMetrics, WeatherSnapshot } from "@/lib/types";

const defaultForecast: ForecastState = { frames: [], currentMinutes: 30, status: "idle" };

function cloneScenario() {
  return structuredClone(DEFAULT_SCENARIO);
}

function toIncident(scenario: IncidentScenario): IncidentDraft {
  return {
    latitude: scenario.incident.latitude,
    longitude: scenario.incident.longitude,
    title: scenario.incident.name,
    incidentType: scenario.incident.incidentType,
    hazardId: scenario.hazardId,
    releaseRateKgS: scenario.release.rateKgS,
    durationMinutes: scenario.release.durationMinutes,
    sourceHeightM: scenario.release.sourceHeightM,
    stability: scenario.weather.stability
  };
}

function toWeather(scenario: IncidentScenario, modelTimestamp: string): WeatherSnapshot {
  return {
    windSpeedKmh: scenario.weather.windSpeedKmh,
    windDirection: scenario.weather.windDirection,
    temperatureC: scenario.weather.temperatureC,
    humidityPct: scenario.weather.humidityPercent,
    stability: `${scenario.weather.stability} (${scenario.weather.stability === "D" ? "Neutral" : "Configured"})`,
    timestamp: modelTimestamp,
    source: "Manual input"
  };
}

interface SimulationStore {
  scenario: IncidentScenario;
  incident: IncidentDraft;
  weather: WeatherSnapshot;
  forecast: ForecastState;
  metrics: ScenarioMetrics;
  validationErrors: ScenarioErrorMap;
  notice: { kind: "success" | "error" | "info"; message: string } | null;
  modelTimestamp: string;
  layers: Record<LayerId, boolean>;
  setScenarioField: (field: string, value: unknown) => void;
  setIncidentField: <K extends keyof IncidentDraft>(field: K, value: IncidentDraft[K]) => void;
  setWeatherField: <K extends keyof WeatherSnapshot>(field: K, value: WeatherSnapshot[K]) => void;
  placeIncident: (latitude: number, longitude: number) => void;
  setCurrentMinutes: (minutes: number) => void;
  toggleLayer: (layer: LayerId) => void;
  runForecast: () => void;
  resetScenario: () => void;
  saveScenario: () => void;
  loadScenario: () => void;
}

function withMetrics(scenario: IncidentScenario) {
  return { scenario, metrics: calculateScenarioMetrics(scenario), validationErrors: validateScenario(scenario) };
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenario: cloneScenario(),
  incident: toIncident(DEFAULT_SCENARIO),
  weather: toWeather(DEFAULT_SCENARIO, "09:42"),
  forecast: defaultForecast,
  metrics: calculateScenarioMetrics(DEFAULT_SCENARIO),
  validationErrors: {},
  notice: null,
  modelTimestamp: "09:42",
  layers: { plume: true, infrastructure: true, uncertainty: true, wind: true },
  setScenarioField: (field, value) => set((state) => {
    const next = structuredClone(state.scenario);
    const [section, key] = field.split(".");
    if (section === "incident" && key && key in next.incident) (next.incident as unknown as Record<string, unknown>)[key] = value;
    else if (section === "weather" && key && key in next.weather) (next.weather as unknown as Record<string, unknown>)[key] = value;
    else if (section === "release" && key && key in next.release) (next.release as unknown as Record<string, unknown>)[key] = value;
    else if (field === "hazardId") next.hazardId = String(value);
    else if (field === "severity") next.severity = Number(value);
    if (section === "release" && key === "rateKgS") next.release.quantityKg = Number(value) * next.release.durationMinutes * 60;
    if (section === "release" && key === "durationMinutes") next.release.quantityKg = next.release.rateKgS * Number(value) * 60;
    return { ...withMetrics(next), incident: toIncident(next), weather: toWeather(next, state.modelTimestamp), notice: null };
  }),
  setIncidentField: (field, value) => {
    const mappings: Partial<Record<keyof IncidentDraft, string>> = {
      title: "incident.name", incidentType: "incident.incidentType", hazardId: "hazardId", releaseRateKgS: "release.rateKgS", durationMinutes: "release.durationMinutes", sourceHeightM: "release.sourceHeightM", stability: "weather.stability", latitude: "incident.latitude", longitude: "incident.longitude"
    };
    const mapped = mappings[field];
    if (mapped) get().setScenarioField(mapped, value);
  },
  setWeatherField: (field, value) => {
    const mappings: Partial<Record<keyof WeatherSnapshot, string>> = { windSpeedKmh: "weather.windSpeedKmh", windDirection: "weather.windDirection", temperatureC: "weather.temperatureC", humidityPct: "weather.humidityPercent", stability: "weather.stability" };
    const mapped = mappings[field];
    if (mapped) get().setScenarioField(mapped, field === "stability" ? String(value).slice(0, 1) : value);
  },
  placeIncident: (latitude, longitude) => {
    get().setScenarioField("incident.latitude", latitude);
    get().setScenarioField("incident.longitude", longitude);
  },
  setCurrentMinutes: (minutes) => set((state) => ({ forecast: { ...state.forecast, currentMinutes: clampTimeline(minutes) } })),
  toggleLayer: (layer) => set((state) => ({ layers: { ...state.layers, [layer]: !state.layers[layer] } })),
  runForecast: () => {
    const { scenario } = get();
    const errors = validateScenario(scenario);
    if (Object.keys(errors).length > 0) {
      set({ validationErrors: errors, forecast: { ...defaultForecast, status: "error" }, notice: { kind: "error", message: "Fix the highlighted configuration fields before running." } });
      return;
    }
    set({ forecast: { ...defaultForecast, status: "running" }, validationErrors: {}, notice: { kind: "info", message: "Calculating simulated forecast…" } });
    window.setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const frames = buildForecastFrames({ ...toIncident(scenario), windSpeedKmh: scenario.weather.windSpeedKmh, windDirection: scenario.weather.windDirection });
      set({ forecast: { frames, currentMinutes: 30, status: "ready", lastRunAt: new Date().toISOString() }, modelTimestamp: timestamp, notice: { kind: "success", message: "Simulated forecast updated." } });
    }, 650);
  },
  resetScenario: () => set({ scenario: cloneScenario(), incident: toIncident(DEFAULT_SCENARIO), weather: toWeather(DEFAULT_SCENARIO, "09:42"), forecast: defaultForecast, metrics: calculateScenarioMetrics(DEFAULT_SCENARIO), validationErrors: {}, notice: { kind: "info", message: "Demo scenario restored." }, modelTimestamp: "09:42" }),
  saveScenario: () => {
    try {
      window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify({ version: 1, scenario: get().scenario }));
      set({ notice: { kind: "success", message: "Scenario saved locally on this device." } });
    } catch {
      set({ notice: { kind: "error", message: "Unable to save in this browser." } });
    }
  },
  loadScenario: () => {
    try {
      const raw = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
      if (!raw) {
        set({ notice: { kind: "info", message: "No saved scenario found." } });
        return;
      }
      const parsed = JSON.parse(raw) as { version?: number; scenario?: unknown };
      const scenario = sanitizeScenario(parsed.scenario ?? parsed);
      set({ ...withMetrics(scenario), incident: toIncident(scenario), weather: toWeather(scenario, get().modelTimestamp), forecast: defaultForecast, notice: { kind: "success", message: "Saved scenario loaded." } });
    } catch {
      set({ notice: { kind: "error", message: "Saved scenario could not be loaded." } });
    }
  }
}));

export { toIncident, toWeather };
