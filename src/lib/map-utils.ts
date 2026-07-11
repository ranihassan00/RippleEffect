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
