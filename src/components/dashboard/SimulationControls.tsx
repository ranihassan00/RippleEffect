"use client";

import { RotateCcw, Save, Upload, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSimulation } from "@/hooks/useSimulation";

export function SimulationControls() {
  const { forecast, notice, runForecast, resetScenario, saveScenario, loadScenario } = useSimulation();
  return <div className="simulation-controls panel">
    <div className="panel-heading"><span>SIMULATION CONTROLS</span><span className="simulated-badge">LOCAL</span></div>
    <div className="simulation-actions">
      <Button variant="primary" onClick={runForecast} disabled={forecast.status === "running"}><Play size={13} /> {forecast.status === "running" ? "CALCULATING" : "RUN FORECAST"}</Button>
      <Button variant="ghost" onClick={resetScenario}><RotateCcw size={13} /> RESET</Button>
      <Button variant="ghost" onClick={saveScenario}><Save size={13} /> SAVE SCENARIO</Button>
      <Button variant="ghost" onClick={loadScenario}><Upload size={13} /> LOAD SCENARIO</Button>
    </div>
    {notice && <p className={`simulation-notice simulation-notice--${notice.kind}`} role="status">{notice.message}</p>}
  </div>;
}
