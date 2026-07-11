"use client";

import { useSimulationStore } from "@/stores/simulation-store";

export function useSimulation() {
  const state = useSimulationStore();
  const currentFrame = state.forecast.frames.find((frame) => frame.minutes === state.forecast.currentMinutes) ?? state.forecast.frames[1];
  return { ...state, currentFrame };
}
