import { RISK_ZONES } from "@/lib/ui-data";
import { riskZoneRadius } from "@/lib/map-utils";

interface RiskZoneLayerProps {
  centerX: number;
  centerY: number;
  minutes: number;
  visible: boolean;
}

export function RiskZoneLayer({ centerX, centerY, minutes, visible }: RiskZoneLayerProps) {
  return (
    <g aria-label="Risk zones" opacity={visible ? 1 : 0} pointerEvents={visible ? "auto" : "none"}>
      {[...RISK_ZONES].reverse().map((zone) => (
        <circle key={zone.id} cx={centerX} cy={centerY} r={riskZoneRadius(zone.id, minutes)} fill={zone.color} fillOpacity="0.08" stroke={zone.color} strokeOpacity="0.58" strokeWidth="2" strokeDasharray="4 6">
          <title>{zone.name}: decision-support estimate</title>
        </circle>
      ))}
    </g>
  );
}
