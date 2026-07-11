import { RISK_ZONES } from "@/lib/ui-data";

export function RiskLegend() {
  return <div className="risk-legend" aria-label="Risk zone legend">{RISK_ZONES.map((zone) => <div className="legend-row" key={zone.id} data-zone={zone.id}><span className="legend-swatch" style={{ background: zone.color }} /><span>{zone.name}</span></div>)}</div>;
}
