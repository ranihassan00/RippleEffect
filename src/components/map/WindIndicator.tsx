import { Wind } from "lucide-react";

export function WindIndicator({ direction, speed }: { direction: string; speed: number }) {
  return (
    <div className="map-floating-card wind-indicator" aria-label={`Wind ${speed} kilometers per hour ${direction}`}>
      <Wind size={16} />
      <div><strong>Wind {speed} km/h {direction}</strong><span>live surface vector</span></div>
      <div className="wind-stream"><i /><i /><i /></div>
    </div>
  );
}
