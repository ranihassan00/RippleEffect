"use client";

import { create } from "zustand";
import { buildForecastFrames, clampTimeline } from "@/lib/forecast";
import { DEFAULT_WEATHER } from "@/lib/demo-data";
import type { ForecastState, IncidentDraft, WeatherSnapshot } from "@/lib/types";

const defaultIncident: IncidentDraft = {
  latitude: 45.4215,
  longitude: -75.6972,
  title: "Factory ammonia leak",
  incidentType: "Factory leak",
  hazardId: "ammonia",
  releaseRateKgS: 1.8,
  durationMinutes: 20,
  sourceHeightM: 5,
  stability: "D"
};

const defaultForecast: ForecastState = { frames: [], currentMinutes: 30, status: "idle" };

interface SimulationStore {
  incident: IncidentDraft;
  weather: WeatherSnapshot;
  forecast: ForecastState;
  layers: Record<string, boolean>;
  setIncidentField: <K extends keyof IncidentDraft>(field: K, value: IncidentDraft[K]) => void;
  setWeatherField: <K extends keyof WeatherSnapshot>(field: K, value: WeatherSnapshot[K]) => void;
  placeIncident: (latitude: number, longitude: number) => void;
  setCurrentMinutes: (minutes: number) => void;
  toggleLayer: (layer: string) => void;
  runForecast: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  incident: defaultIncident,
  weather: DEFAULT_WEATHER,
  forecast: defaultForecast,
  layers: { plume: true, infrastructure: true, uncertainty: true, wind: true },
  setIncidentField: (field, value) => set((state) => ({ incident: { ...state.incident, [field]: value } })),
  setWeatherField: (field, value) => set((state) => ({ weather: { ...state.weather, [field]: value, source: "Manual input" } })),
  placeIncident: (latitude, longitude) => set((state) => ({ incident: { ...state.incident, latitude, longitude } })),
  setCurrentMinutes: (minutes) => set((state) => ({ forecast: { ...state.forecast, currentMinutes: clampTimeline(minutes) } })),
  toggleLayer: (layer) => set((state) => ({ layers: { ...state.layers, [layer]: !state.layers[layer] } })),
  runForecast: () => {
    const { incident, weather } = get();
    set({ forecast: { ...defaultForecast, currentMinutes: 30, status: "running" } });
    setTimeout(() => {
      const frames = buildForecastFrames({ ...incident, windSpeedKmh: weather.windSpeedKmh, windDirection: weather.windDirection });
      set({ forecast: { frames, currentMinutes: 30, status: "ready", lastRunAt: new Date().toISOString() } });
    }, 650);
  }
}));
