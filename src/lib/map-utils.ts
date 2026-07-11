import { RISK_ZONES } from "@/lib/ui-data";
import type { RiskZoneId } from "@/lib/types";

export interface MapViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MIN_MAP_SCALE = 1;
const MAX_MAP_SCALE = 2.5;

export function clampMapScale(scale: number) {
  return Math.max(MIN_MAP_SCALE, Math.min(MAX_MAP_SCALE, Number(scale.toFixed(2))));
}

export function resetViewport(): MapViewport {
  return { scale: 1, offsetX: 0, offsetY: 0 };
}

function clampOffset(offset: number, scale: number) {
  const limit = (clampMapScale(scale) - 1) * 50;
  return Math.max(-limit, Math.min(limit, Number(offset.toFixed(2))));
}

export function zoomViewport(viewport: MapViewport, factor: number): MapViewport {
  const scale = clampMapScale(viewport.scale * factor);
  return {
    scale,
    offsetX: clampOffset(viewport.offsetX, scale),
    offsetY: clampOffset(viewport.offsetY, scale)
  };
}

export function panViewport(viewport: MapViewport, dx: number, dy: number): MapViewport {
  return {
    scale: clampMapScale(viewport.scale),
    offsetX: clampOffset(viewport.offsetX + dx, viewport.scale),
    offsetY: clampOffset(viewport.offsetY + dy, viewport.scale)
  };
}

export function viewportPointToPercent(point: { x: number; y: number }, viewport: MapViewport, width: number, height: number) {
  const xPct = ((point.x / width) * 100 - 50 - viewport.offsetX) / viewport.scale + 50;
  const yPct = ((point.y / height) * 100 - 50 - viewport.offsetY) / viewport.scale + 50;
  return { xPct: Number(xPct.toFixed(2)), yPct: Number(yPct.toFixed(2)) };
}

export function riskZoneRadius(zone: RiskZoneId, minutes: number) {
  const index = RISK_ZONES.findIndex((item) => item.id === zone);
  const timeFactor = Math.max(0.35, Math.min(1, minutes / 60));
  return Number((20 + 10 * timeFactor + Math.max(index, 0) * 24 * timeFactor).toFixed(2));
}

export function mapPercentToGeo(xPct: number, yPct: number) {
  return {
    latitude: Number((45.47 - yPct * 0.045).toFixed(4)),
    longitude: Number((-75.82 + xPct * 0.16).toFixed(4))
  };
}

export function windBearing(direction: string) {
  const bearings: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, WNW: 292, ENE: 67 };
  return bearings[direction] ?? 270;
}
