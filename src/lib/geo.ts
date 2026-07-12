import type { Coordinate, InfrastructureFeature, RiskZoneId } from "@/lib/types";

export interface GeoJsonFeature<TGeometry = GeoJsonGeometry> {
  type: "Feature";
  geometry: TGeometry;
  properties: Record<string, string | number | boolean | null>;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export type GeoJsonPosition = [number, number];
export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: GeoJsonPosition[][] }
  | { type: "LineString"; coordinates: GeoJsonPosition[] }
  | { type: "Point"; coordinates: GeoJsonPosition };

export function isValidCoordinate(coordinate: Coordinate) {
  return Number.isFinite(coordinate.latitude)
    && Number.isFinite(coordinate.longitude)
    && coordinate.latitude >= -90
    && coordinate.latitude <= 90
    && coordinate.longitude >= -180
    && coordinate.longitude <= 180;
}

export function parseCoordinateValue(value: string, axis: "latitude" | "longitude") {
  if (value.trim() === "") return null;
  const number = Number(value);
  const valid = Number.isFinite(number)
    && (axis === "latitude" ? number >= -90 && number <= 90 : number >= -180 && number <= 180);
  return valid ? Number(number.toFixed(6)) : null;
}

const CARDINAL_BEARINGS: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135,
  SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270,
  WNW: 292.5, NW: 315, NNW: 337.5
};

export function windDirectionToDegrees(direction: string | number) {
  if (typeof direction === "number" && Number.isFinite(direction)) return ((direction % 360) + 360) % 360;
  const normalized = String(direction).trim().toUpperCase();
  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && normalized !== "") return ((numeric % 360) + 360) % 360;
  return CARDINAL_BEARINGS[normalized] ?? 270;
}

/** Meteorological wind is the direction the wind comes from; plume travel is the opposite bearing. */
export function meteorologicalToTravelBearing(direction: string | number) {
  return (windDirectionToDegrees(direction) + 180) % 360;
}

function destinationPoint(origin: Coordinate, bearingDegrees: number, distanceKm: number): Coordinate {
  const radiusKm = 6371;
  const angularDistance = distanceKm / radiusKm;
  const bearing = bearingDegrees * Math.PI / 180;
  const latitude = origin.latitude * Math.PI / 180;
  const longitude = origin.longitude * Math.PI / 180;
  const nextLatitude = Math.asin(Math.sin(latitude) * Math.cos(angularDistance) + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing));
  const nextLongitude = longitude + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude), Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(nextLatitude));
  return { latitude: nextLatitude * 180 / Math.PI, longitude: nextLongitude * 180 / Math.PI };
}

function toPosition(coordinate: Coordinate): GeoJsonPosition {
  return [Number(coordinate.longitude.toFixed(6)), Number(coordinate.latitude.toFixed(6))];
}

const ZONES: ReadonlyArray<{ id: RiskZoneId; name: string; color: string; outline: string; multiplier: number }> = [
  { id: "monitoring", name: "Monitoring", color: "#81b938", outline: "#b8ec71", multiplier: 0.45 },
  { id: "advisory", name: "Advisory", color: "#efc529", outline: "#ffe478", multiplier: 0.68 },
  { id: "shelter", name: "Shelter in Place", color: "#ff762b", outline: "#ffab72", multiplier: 0.84 },
  { id: "evacuation", name: "Evacuation", color: "#e73545", outline: "#ff7d83", multiplier: 1 },
  { id: "severe", name: "Severe Exposure", color: "#b92169", outline: "#f185bb", multiplier: 1.16 }
];

export interface LocalPlumeOptions {
  origin: Coordinate;
  windDirection: string | number;
  windSpeedKmh: number;
  releaseRateKgS: number;
  releaseDurationMinutes: number;
  currentMinutes: number;
}

export function createLocalPlumeGeoJSON(options: LocalPlumeOptions): GeoJsonFeatureCollection {
  const travelBearing = meteorologicalToTravelBearing(options.windDirection);
  const timeFactor = Math.max(0.2, Math.min(1.5, options.currentMinutes / 30));
  const releaseFactor = Math.max(0.55, Math.min(1.8, options.releaseRateKgS / 1.8));
  const durationFactor = Math.max(0.55, Math.min(1.6, options.releaseDurationMinutes / 20));
  const speedFactor = Math.max(0.65, Math.min(1.8, options.windSpeedKmh / 12));
  const baseDistanceKm = Math.max(0.8, 4.8 * timeFactor * releaseFactor * durationFactor * speedFactor);
  const irregularity = [0.18, 1, 0.88, 1.08, 0.94, 1.14, 1];
  const features: GeoJsonFeature[] = ZONES.map((zone) => {
    const distanceKm = baseDistanceKm * zone.multiplier;
    const points = irregularity.map((variance, index) => {
      const progress = index / (irregularity.length - 1);
      const distance = Math.max(0.08, distanceKm * progress * variance);
      const center = destinationPoint(options.origin, travelBearing, distance);
      const widthKm = Math.max(0.08, distanceKm * (0.06 + progress * (0.1 + zone.multiplier * 0.08)) * variance);
      return { left: destinationPoint(center, travelBearing - 90, widthKm), right: destinationPoint(center, travelBearing + 90, widthKm) };
    });
    const polygon = [toPosition(options.origin), ...points.map((point) => toPosition(point.left)), ...points.slice().reverse().map((point) => toPosition(point.right)), toPosition(options.origin)];
    return { type: "Feature", geometry: { type: "Polygon", coordinates: [polygon] }, properties: { zone: zone.id, label: zone.name, fillColor: zone.color, outlineColor: zone.outline, opacity: 0.2 + zone.multiplier * 0.2, travelBearing, distanceKm: Number(distanceKm.toFixed(2)), estimateLabel: "UI DEMO ESTIMATE" } };
  });
  const outerDistance = baseDistanceKm * 1.32;
  const outerPoints = irregularity.map((variance, index) => {
    const progress = index / (irregularity.length - 1);
    const center = destinationPoint(options.origin, travelBearing, outerDistance * progress * variance);
    const widthKm = Math.max(0.18, outerDistance * (0.12 + progress * 0.16) * variance);
    return { left: destinationPoint(center, travelBearing - 90, widthKm), right: destinationPoint(center, travelBearing + 90, widthKm) };
  });
  features.push({ type: "Feature", geometry: { type: "Polygon", coordinates: [[toPosition(options.origin), ...outerPoints.map((point) => toPosition(point.left)), ...outerPoints.slice().reverse().map((point) => toPosition(point.right)), toPosition(options.origin)]] }, properties: { zone: "outerExposure", fillColor: "#66d9ff", outlineColor: "#8be5ff", opacity: 0.06, estimateLabel: "UI DEMO ESTIMATE" } });
  const uncertaintyLeft = destinationPoint(options.origin, travelBearing - 90, baseDistanceKm * 0.16);
  const uncertaintyRight = destinationPoint(options.origin, travelBearing + 90, baseDistanceKm * 0.16);
  const uncertaintyEndLeft = destinationPoint(options.origin, travelBearing - 90, baseDistanceKm * 1.38);
  const uncertaintyEndRight = destinationPoint(options.origin, travelBearing + 90, baseDistanceKm * 1.38);
  features.push({ type: "Feature", geometry: { type: "Polygon", coordinates: [[toPosition(uncertaintyLeft), toPosition(uncertaintyEndLeft), toPosition(uncertaintyEndRight), toPosition(uncertaintyRight), toPosition(uncertaintyLeft)]] }, properties: { zone: "uncertainty", fillColor: "#79d7ff", outlineColor: "#79d7ff", opacity: 0.04, estimateLabel: "UI DEMO ESTIMATE" } });
  const denseEnd = destinationPoint(options.origin, travelBearing, Math.max(0.9, baseDistanceKm * 0.78));
  const denseLeft = destinationPoint(denseEnd, travelBearing - 90, Math.max(0.3, baseDistanceKm * 0.12));
  const denseRight = destinationPoint(denseEnd, travelBearing + 90, Math.max(0.3, baseDistanceKm * 0.12));
  features.push({ type: "Feature", geometry: { type: "LineString", coordinates: [toPosition(options.origin), toPosition(denseLeft), toPosition(denseRight)] }, properties: { zone: "denseGasLimitation", outlineColor: "#ffffff", estimateLabel: "DENSE-GAS LIMITATION" } });
  return { type: "FeatureCollection", features };
}

export function createSmokeTextureGeoJSON(options: LocalPlumeOptions): GeoJsonFeatureCollection {
  const travelBearing = meteorologicalToTravelBearing(options.windDirection);
  const scale = Math.max(0.3, Math.min(1.4, options.currentMinutes / 30));
  const samples = [[0.25, -0.18, 0.16, 9], [0.42, 0.12, 0.13, 12], [0.58, -0.08, 0.1, 14], [0.72, 0.15, 0.08, 11], [0.9, -0.13, 0.06, 8]] as const;
  return { type: "FeatureCollection", features: samples.map(([progress, lateral, opacity, radius]) => { const center = destinationPoint(options.origin, travelBearing, Math.max(0.15, options.windSpeedKmh / 12 * options.currentMinutes / 12 * progress)); const point = destinationPoint(center, travelBearing + 90, lateral * scale); return { type: "Feature", geometry: { type: "Point", coordinates: toPosition(point) }, properties: { opacity, radius: radius * scale, label: "UI DEMO ESTIMATE" } }; }) };
}
export function distanceKm(a: Coordinate, b: Coordinate) {
  const radiusKm = 6371;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const deltaLat = (b.latitude - a.latitude) * Math.PI / 180;
  const deltaLon = (b.longitude - a.longitude) * Math.PI / 180;
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

const INFRASTRUCTURE_COLORS: Record<InfrastructureFeature["type"], string> = {
  school: "#8fd65a",
  hospital: "#55b9f2",
  "fire-station": "#ff7a46",
  transit: "#f4c84b",
  water: "#58b7f1",
  utility: "#e8b943",
  communications: "#b88bea",
  road: "#b88bea"
};

export function createInfrastructureLeaderGeoJSON(origin: Coordinate, features: InfrastructureFeature[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: features
      .filter((feature): feature is InfrastructureFeature & { latitude: number; longitude: number } => Number.isFinite(feature.latitude) && Number.isFinite(feature.longitude))
      .map((feature) => ({
        type: "Feature",
        geometry: { type: "LineString", coordinates: [toPosition(origin), toPosition({ latitude: feature.latitude, longitude: feature.longitude })] },
        properties: { id: feature.id, color: INFRASTRUCTURE_COLORS[feature.type], type: feature.type }
      }))
  };
}
export function createInfrastructureGeoJSON(features: InfrastructureFeature[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: features
      .filter((feature): feature is InfrastructureFeature & { latitude: number; longitude: number } => Number.isFinite(feature.latitude) && Number.isFinite(feature.longitude))
      .map((feature) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [feature.longitude, feature.latitude] },
        properties: { id: feature.id, type: feature.type, name: feature.name, shortLabel: feature.shortLabel, zone: feature.zone, status: feature.status ?? "Low", severity: feature.severity ?? "Low" }
      }))
  };
}

export function createWindVectorGeoJSON(origin: Coordinate, windDirection: string | number, windSpeedKmh: number): GeoJsonFeatureCollection {
  const travelBearing = meteorologicalToTravelBearing(windDirection);
  const distanceKm = Math.max(0.45, Math.min(1.8, windSpeedKmh / 10));
  const tip = destinationPoint(origin, travelBearing, distanceKm);
  const wingA = destinationPoint(tip, travelBearing + 150, distanceKm * 0.18);
  const wingB = destinationPoint(tip, travelBearing - 150, distanceKm * 0.18);
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry: { type: "LineString", coordinates: [toPosition(origin), toPosition(tip)] }, properties: { travelBearing, windSpeedKmh, label: "WIND VECTOR · UI DEMO" } },
      { type: "Feature", geometry: { type: "LineString", coordinates: [toPosition(wingA), toPosition(tip), toPosition(wingB)] }, properties: { travelBearing, windSpeedKmh, label: "WIND VECTOR · UI DEMO" } }
    ]
  };
}
