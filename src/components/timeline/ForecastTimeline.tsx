"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Clock3 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Slider } from "@/components/ui/Slider";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";

const MAX_FORECAST_MINUTES = 60;
const MIN_FORECAST_MINUTES = 0;
const PLAYBACK_STEP_MINUTES = 5;

function clampTimelineValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function advanceTimeline(currentMinutes: number, stepMinutes: number, min: number, max: number) {
  const normalizedCurrent = clampTimelineValue(currentMinutes, min, max);
  return normalizedCurrent >= max ? min : Math.min(max, normalizedCurrent + stepMinutes);
}

export function ForecastTimeline() {
  const { forecast, setCurrentMinutes } = useSimulation();
  const [playing, setPlaying] = useState(false);
  const min = MIN_FORECAST_MINUTES;
  const max = MAX_FORECAST_MINUTES;
  const currentMinutes = clampTimelineValue(forecast.currentMinutes, min, max);
  const progressPercent = max > min
    ? Math.min(100, Math.max(0, ((currentMinutes - min) / (max - min)) * 100))
    : 0;
  const sliderStyle = { "--timeline-progress": `${progressPercent}%` } as CSSProperties;

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setCurrentMinutes(advanceTimeline(currentMinutes, 1, min, max));
    }, 90);

    return () => window.clearInterval(timer);
  }, [playing, currentMinutes, min, max, setCurrentMinutes]);

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPlaying(false);
    setCurrentMinutes(Number(event.target.value));
  }

  function handleStep() {
    setPlaying(false);
    setCurrentMinutes(advanceTimeline(currentMinutes, PLAYBACK_STEP_MINUTES, min, max));
  }

  return (
    <div className="timeline-panel" aria-label="Forecast timeline controls">
      <div className="timeline-heading">
        <span>FORECAST TIMELINE</span>
        <span className="timeline-validity"><Clock3 size={13} /> 15 / 30 / 60 MIN FRAMES</span>
      </div>
      <div className="timeline-row">
        <PlaybackControls playing={playing} onToggle={() => setPlaying((value) => !value)} onStep={handleStep} />
        <div className="timeline-track-wrap">
          <div className="timeline-labels">
            <span>0 MIN</span>
            <span>15 MIN</span>
            <span className={currentMinutes === 30 ? "active" : ""}>CURRENT {currentMinutes} MIN</span>
            <span>60 MIN</span>
          </div>
          <Slider
            aria-label="Forecast timeline"
            min={min}
            max={max}
            value={currentMinutes}
            style={sliderStyle}
            onChange={handleSliderChange}
          />
          <div className="timeline-ticks"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="timeline-key"><span className="key-line" /> Modelled exposure area<span className="key-dash" /> Forecast uncertainty</div>
      </div>
    </div>
  );
}
