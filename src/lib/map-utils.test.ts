import { describe, expect, it } from "vitest";
import {
  clampMapScale,
  panViewport,
  resetViewport,
  riskZoneRadius,
  viewportPointToPercent,
  zoomViewport
} from "@/lib/map-utils";

describe("map viewport helpers", () => {
  it("clamps zoom to the supported presentation range", () => {
    expect(clampMapScale(0.25)).toBe(1);
    expect(clampMapScale(1.75)).toBe(1.75);
    expect(clampMapScale(9)).toBe(2.5);
  });

  it("zooms and pans without allowing the viewport to leave the map", () => {
    const zoomed = zoomViewport(resetViewport(), 2);
    expect(zoomed.scale).toBe(2);
    expect(panViewport(zoomed, 100, -100)).toEqual({ scale: 2, offsetX: 50, offsetY: -50 });
    expect(panViewport(zoomed, -100, 100)).toEqual({ scale: 2, offsetX: -50, offsetY: 50 });
  });

  it("restores the default viewport", () => {
    expect(resetViewport()).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
  });

  it("converts a screen point back through the viewport transform", () => {
    expect(viewportPointToPercent({ x: 50, y: 50 }, { scale: 2, offsetX: 10, offsetY: -8 }, 100, 100)).toEqual({ xPct: 45, yPct: 54 });
  });

  it("keeps risk-zone radii ordered as the forecast grows", () => {
    const minutes = 30;
    const radii = ["monitoring", "advisory", "shelter", "evacuation", "severe"].map((zone) => riskZoneRadius(zone as never, minutes));
    expect(radii).toEqual([...radii].sort((a, b) => a - b));
    expect(riskZoneRadius("monitoring", 60)).toBeGreaterThan(riskZoneRadius("monitoring", 15));
  });
});
