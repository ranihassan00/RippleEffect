"use client";

import { getForecastFrameAtMinutes } from "@/lib/forecast-frame";
import { useSimulationStore } from "@/stores/simulation-store";
import { toIncident, toWeather } from "@/stores/simulation-store";

export function useSimulation() {
  const state = useSimulationStore();
  const currentFrame = getForecastFrameAtMinutes(state.forecast.frames, state.forecast.currentMinutes);
  const metrics = currentFrame
    ? {
        ...state.metrics,
        affectedAreaKm2: currentFrame.affectedAreaKm2,
        downwindDistanceKm: currentFrame.plumeLengthKm,
        populationAffected: Math.round(state.metrics.populationAffected * Math.max(0.35, Math.min(1, currentFrame.minutes / 30))),
        confidence: currentFrame.confidence,
        infrastructure: state.metrics.infrastructure
          .filter((item) => currentFrame.infrastructure.some((feature) => feature.id === item.id))
          .map((item) => ({
            ...item,
            impactMinutes: Math.max(3, Math.round(item.impactMinutes * Math.max(0.6, currentFrame.minutes / 30)))
          }))
      }
    : state.metrics;

  return {
    ...state,
    metrics,
    incident: toIncident(state.scenario),
    weather: toWeather(state.scenario, state.modelTimestamp),
    currentFrame
  };
}
