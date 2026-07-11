import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SCENARIO } from "@/lib/scenario";
import { useSimulationStore } from "@/stores/simulation-store";

describe("simulation store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSimulationStore.getState().resetScenario();
  });

  it("blocks a forecast with invalid required fields", () => {
    useSimulationStore.getState().setScenarioField("incident.name", " ");
    useSimulationStore.getState().runForecast();
    expect(useSimulationStore.getState().forecast.status).toBe("error");
    expect(useSimulationStore.getState().validationErrors["incident.name"]).toBeTruthy();
  });

  it("runs a deterministic local forecast and can reset", () => {
    useSimulationStore.getState().runForecast();
    expect(useSimulationStore.getState().forecast.status).toBe("running");
    vi.advanceTimersByTime(700);
    expect(useSimulationStore.getState().forecast.status).toBe("ready");
    expect(useSimulationStore.getState().metrics?.affectedAreaKm2).toBeGreaterThan(0);
    useSimulationStore.getState().setScenarioField("incident.name", "Changed");
    useSimulationStore.getState().resetScenario();
    expect(useSimulationStore.getState().scenario).toEqual(DEFAULT_SCENARIO);
  });
});
