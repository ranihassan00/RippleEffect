"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Slider } from "@/components/ui/Slider";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";

const MAX_FORECAST_MINUTES = 60;
const PLAYBACK_STEP_MINUTES = 5;

function advanceTimeline(currentMinutes: number, stepMinutes: number) {
  return currentMinutes >= MAX_FORECAST_MINUTES ? 0 : currentMinutes + stepMinutes;
}

export function ForecastTimeline() {
  const { forecast, setCurrentMinutes } = useSimulation();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setCurrentMinutes(advanceTimeline(forecast.currentMinutes, 1));
    }, 90);

    return () => window.clearInterval(timer);
  }, [playing, forecast.currentMinutes, setCurrentMinutes]);

  return (
    <div className="timeline-panel">
      <div className="timeline-heading">
        <span>FORECAST TIMELINE</span>
        <span className="timeline-validity"><Clock3 size={13} /> 15 / 30 / 60 MIN FRAMES</span>
      </div>
      <div className="timeline-row">
        <PlaybackControls
          playing={playing}
          onToggle={() => setPlaying((value) => !value)}
          onStep={() => setCurrentMinutes(advanceTimeline(forecast.currentMinutes, PLAYBACK_STEP_MINUTES))}
        />
        <div className="timeline-track-wrap">
          <div className="timeline-labels">
            <span>0 MIN</span>
            <span>15 MIN</span>
            <span className={forecast.currentMinutes === 30 ? "active" : ""}>CURRENT {forecast.currentMinutes} MIN</span>
            <span>60 MIN</span>
          </div>
          <Slider
            aria-label="Forecast timeline"
            min="0"
            max={String(MAX_FORECAST_MINUTES)}
            value={forecast.currentMinutes}
            onChange={(event) => setCurrentMinutes(Number(event.target.value))}
          />
          <div className="timeline-ticks"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="timeline-key"><span className="key-line" /> Modelled exposure area<span className="key-dash" /> Forecast uncertainty</div>
      </div>
    </div>
  );
}
