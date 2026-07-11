import type { ForecastFrame } from "@/lib/types";

export function getForecastFrameAtMinutes(frames: ForecastFrame[], minutes: number) {
  if (frames.length === 0) return undefined;
  const sorted = [...frames].sort((a, b) => a.minutes - b.minutes);
  const exact = sorted.find((frame) => frame.minutes === minutes);
  if (exact) return exact;

  const upper = sorted.find((frame) => frame.minutes > minutes);
  const lower = [...sorted].reverse().find((frame) => frame.minutes < minutes);
  if (!lower) return sorted[0];
  if (!upper) return sorted[sorted.length - 1];

  const ratio = (minutes - lower.minutes) / (upper.minutes - lower.minutes);
  const interpolate = (start: number, end: number) => Number((start + (end - start) * ratio).toFixed(1));
  const closest = ratio < 0.5 ? lower : upper;

  return {
    ...closest,
    minutes,
    plumeLengthKm: interpolate(lower.plumeLengthKm, upper.plumeLengthKm),
    affectedAreaKm2: interpolate(lower.affectedAreaKm2, upper.affectedAreaKm2),
    peakConcentration: interpolate(lower.peakConcentration, upper.peakConcentration)
  };
}
