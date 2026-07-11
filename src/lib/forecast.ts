import { DEMO_INFRASTRUCTURE } from "@/lib/demo-data";
import type { ForecastFrame, IncidentDraft, RiskZoneId } from "@/lib/types";

const forecastMinutes = [15, 30, 60];

export function clampTimeline(minutes: number) {
  return Math.max(0, Math.min(60, Math.round(minutes)));
}

export function getRiskZone(concentration: number): RiskZoneId {
  if (concentration >= 1) return "severe";
  if (concentration >= 0.6) return "evacuation";
  if (concentration >= 0.3) return "shelter";
  if (concentration >= 0.1) return "advisory";
  return "monitoring";
}

function windFactor(direction: string) {
  return direction.includes("W") ? 1.06 : direction.includes("E") ? 0.92 : 1;
}

export function buildForecastFrames(input: Pick<IncidentDraft, "latitude" | "longitude" | "releaseRateKgS" | "sourceHeightM" | "hazardId"> & { windSpeedKmh: number; windDirection: string }): ForecastFrame[] {
  const directionFactor = windFactor(input.windDirection);
  const speedFactor = Math.max(input.windSpeedKmh, 2) / 12;
  const releaseFactor = Math.max(input.releaseRateKgS, 0.1) / 1.8;
  const heightFactor = 1 + Math.min(input.sourceHeightM, 30) / 90;

  return forecastMinutes.map((minutes, index) => {
    const timeFactor = minutes / 30;
    const plumeLengthKm = Number((2.7 * timeFactor * speedFactor * directionFactor * heightFactor).toFixed(1));
    const affectedAreaKm2 = Number((3.4 * timeFactor * releaseFactor * heightFactor).toFixed(1));
    const peakConcentration = Number((0.26 * releaseFactor * (1 / Math.sqrt(timeFactor)) * (1 / Math.max(speedFactor, 0.35))).toFixed(2));
    const uncertainty = minutes >= 60 ? "High" : minutes >= 30 ? "Medium" : "Low";
    const visibleInfrastructure = DEMO_INFRASTRUCTURE.filter((feature) => {
      if (minutes === 15) return feature.zone === "monitoring" || feature.zone === "advisory";
      if (minutes === 30) return feature.zone !== "monitoring";
      return true;
    });

    return {
      minutes,
      plumeLengthKm,
      affectedAreaKm2,
      peakConcentration,
      confidence: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
      uncertainty,
      infrastructure: visibleInfrastructure,
      summary: minutes === 30
        ? "The predicted plume extends east of the incident site. Two schools and one hospital intersect the higher-concentration zones."
        : minutes === 15
          ? "Early dispersion remains concentrated near the source. Monitor downwind corridors as the plume develops."
          : "Uncertainty increases beyond 45 minutes as the forecast integrates more dispersion and wind variability."
    };
  });
}
