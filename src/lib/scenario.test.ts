import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO, calculateScenarioMetrics, getRiskLevel, sanitizeScenario, validateScenario } from "@/lib/scenario";

describe("scenario helpers", () => {
  it("accepts the default demo scenario", () => {
    expect(validateScenario(DEFAULT_SCENARIO)).toEqual({});
  });

  it("reports required and out-of-range inputs", () => {
    const errors = validateScenario({
      ...DEFAULT_SCENARIO,
      incident: { ...DEFAULT_SCENARIO.incident, name: " ", location: "", date: "", time: "" },
      release: { ...DEFAULT_SCENARIO.release, rateKgS: 0, durationMinutes: 0, containmentPercent: 120 },
      weather: { ...DEFAULT_SCENARIO.weather, windSpeedKmh: 250 }
    });

    expect(errors).toMatchObject({
      "incident.name": expect.any(String),
      "incident.location": expect.any(String),
      "incident.date": expect.any(String),
      "incident.time": expect.any(String),
      "release.rateKgS": expect.any(String),
      "release.durationMinutes": expect.any(String),
      "release.containmentPercent": expect.any(String),
      "weather.windSpeedKmh": expect.any(String)
    });
  });

  it("calculates deterministic, input-sensitive metrics", () => {
    const baseline = calculateScenarioMetrics(DEFAULT_SCENARIO);
    const strongerWind = calculateScenarioMetrics({
      ...DEFAULT_SCENARIO,
      weather: { ...DEFAULT_SCENARIO.weather, windSpeedKmh: 30 }
    });

    expect(calculateScenarioMetrics(DEFAULT_SCENARIO)).toEqual(baseline);
    expect(strongerWind.downwindDistanceKm).toBeGreaterThan(baseline.downwindDistanceKm);
    expect(baseline.risks).toHaveLength(5);
    expect(baseline.affectedAreaKm2).toBeGreaterThan(0);
  });

  it("maps scores to semantic risk levels", () => {
    expect(getRiskLevel(10)).toBe("Low");
    expect(getRiskLevel(35)).toBe("Moderate");
    expect(getRiskLevel(65)).toBe("High");
    expect(getRiskLevel(90)).toBe("Critical");
  });

  it("sanitizes unsupported loaded values back to the demo scenario", () => {
    const loaded = sanitizeScenario({ incident: { name: "Loaded", hazardId: "not-real" }, weather: { windSpeedKmh: "bad" } });
    expect(loaded.incident.name).toBe("Loaded");
    expect(loaded.hazardId).toBe(DEFAULT_SCENARIO.hazardId);
    expect(loaded.weather.windSpeedKmh).toBe(DEFAULT_SCENARIO.weather.windSpeedKmh);
  });
});
