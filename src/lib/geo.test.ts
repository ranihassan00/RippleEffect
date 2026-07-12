import { describe, expect, it } from "vitest";
import { DEMO_INFRASTRUCTURE, DEFAULT_SCENARIO } from "@/lib/demo-data";
import { createInfrastructureGeoJSON, createLocalPlumeGeoJSON, meteorologicalToTravelBearing, parseCoordinateValue } from "@/lib/geo";
import { useSimulationStore } from "@/stores/simulation-store";

describe("geographic map helpers", () => {
  it("loads the incident at the Ottawa demo coordinates", () => {
    expect(DEFAULT_SCENARIO.incident).toMatchObject({ latitude: 45.4215, longitude: -75.6972 });
  });

  it("validates and rounds editable coordinate values", () => {
    expect(parseCoordinateValue("45.42151234", "latitude")).toBe(45.421512);
    expect(parseCoordinateValue("-181", "longitude")).toBeNull();
    expect(parseCoordinateValue("", "latitude")).toBeNull();
  });

  it("converts meteorological wind-from direction into travel bearing", () => {
    expect(meteorologicalToTravelBearing("N")).toBe(180);
    expect(meteorologicalToTravelBearing("WNW")).toBe(112.5);
  });

  it("rotates the plume and grows its geographic extent with time", () => {
    const northWind = createLocalPlumeGeoJSON({ origin: DEFAULT_SCENARIO.incident, windDirection: "N", windSpeedKmh: 12, releaseRateKgS: 1.8, releaseDurationMinutes: 20, currentMinutes: 30 });
    const later = createLocalPlumeGeoJSON({ origin: DEFAULT_SCENARIO.incident, windDirection: "N", windSpeedKmh: 12, releaseRateKgS: 1.8, releaseDurationMinutes: 20, currentMinutes: 60 });
    const southWind = createLocalPlumeGeoJSON({ origin: DEFAULT_SCENARIO.incident, windDirection: "S", windSpeedKmh: 12, releaseRateKgS: 1.8, releaseDurationMinutes: 20, currentMinutes: 30 });

    expect(northWind.features[0].properties.travelBearing).toBe(180);
    expect(later.features[0].properties.distanceKm).toBeGreaterThan(northWind.features[0].properties.distanceKm as number);
    expect(southWind.features[0].properties.travelBearing).toBe(0);
    expect(northWind.features[0].geometry).not.toEqual(southWind.features[0].geometry);
  });

  it("keeps demo infrastructure as real geographic points across the requested types", () => {
    const types = new Set(DEMO_INFRASTRUCTURE.map((feature) => feature.type));
    expect(types).toEqual(new Set(["school", "hospital", "fire-station", "transit", "road", "utility", "communications", "water"]));
    expect(DEMO_INFRASTRUCTURE.every((feature) => typeof feature.latitude === "number" && typeof feature.longitude === "number")).toBe(true);
    expect(createInfrastructureGeoJSON(DEMO_INFRASTRUCTURE).features).toHaveLength(DEMO_INFRASTRUCTURE.length);
  });

  it("rejects invalid map placements without changing the shared incident coordinate", () => {
    useSimulationStore.getState().resetScenario();
    useSimulationStore.getState().placeIncident(95, -75.6972);
    expect(useSimulationStore.getState().incident).toMatchObject({ latitude: 45.4215, longitude: -75.6972 });
  });

  it("uses one layer state for every map visibility toggle", () => {
    useSimulationStore.getState().resetScenario();
    useSimulationStore.getState().toggleLayer("schools");
    useSimulationStore.getState().toggleLayer("denseGasLimitation");
    expect(useSimulationStore.getState().layers.schools).toBe(false);
    expect(useSimulationStore.getState().layers.denseGasLimitation).toBe(false);
  });
});
