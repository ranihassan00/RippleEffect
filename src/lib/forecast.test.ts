import { describe, expect, it } from "vitest";
import { buildForecastFrames, clampTimeline, getRiskZone } from "@/lib/forecast";

describe("forecast helpers", () => {
  it("builds three time-indexed forecast frames from an incident and wind vector", () => {
    const frames = buildForecastFrames({
      latitude: 45.4215,
      longitude: -75.6972,
      windSpeedKmh: 12,
      windDirection: "WNW",
      releaseRateKgS: 1.8,
      sourceHeightM: 5,
      hazardId: "ammonia"
    });

    expect(frames.map((frame) => frame.minutes)).toEqual([15, 30, 60]);
    expect(frames[2].plumeLengthKm).toBeGreaterThan(frames[0].plumeLengthKm);
    expect(frames[2].uncertainty).toBe("High");
    expect(frames[1].infrastructure).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "school" })])
    );
  });

  it("maps concentration thresholds into semantic risk zones", () => {
    expect(getRiskZone(0.03)).toBe("monitoring");
    expect(getRiskZone(0.18)).toBe("advisory");
    expect(getRiskZone(0.44)).toBe("shelter");
    expect(getRiskZone(0.8)).toBe("evacuation");
    expect(getRiskZone(1.4)).toBe("severe");
  });

  it("clamps timeline values to the 0 to 60 minute forecast window", () => {
    expect(clampTimeline(-10)).toBe(0);
    expect(clampTimeline(31)).toBe(31);
    expect(clampTimeline(88)).toBe(60);
  });
});
