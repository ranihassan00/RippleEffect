import type { RiskZoneId } from "@/lib/types";

export const RISK_ZONES: Array<{ id: RiskZoneId; name: string; color: string; detail: string }> = [
  { id: "monitoring", name: "Monitoring", color: "#71bd3c", detail: "Low probability of exposure." },
  { id: "advisory", name: "Advisory", color: "#e8ca25", detail: "Possible exposure. Be aware." },
  { id: "shelter", name: "Shelter in Place", color: "#f28322", detail: "Exposure possible. Shelter indoors." },
  { id: "evacuation", name: "Evacuation", color: "#f04349", detail: "High exposure probability." },
  { id: "severe", name: "Severe Exposure", color: "#d33b93", detail: "Life-threatening exposure possible." }
];
