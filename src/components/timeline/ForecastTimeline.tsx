"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Clock3 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Slider } from "@/components/ui/Slider";
import { PlaybackControls, type PlaybackSpeed } from "@/components/timeline/PlaybackControls";

const MAX_FORECAST_MINUTES = 60;
const MIN_FORECAST_MINUTES = 0;
const PLAYBACK_STEP_MINUTES = 5;
const BASE_PLAYBACK_INTERVAL_MS = 90;
const TIMELINE_MARKERS = [0, 15, 30, 60] as const;

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
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const min = MIN_FORECAST_MINUTES;
  const max = MAX_FORECAST_MINUTES;
  const currentMinutes = clampTimelineValue(forecast.currentMinutes, min, max);
  const currentMinutesRef = useRef(currentMinutes);
  const progressPercent = max > min
    ? Math.min(100, Math.max(0, ((currentMinutes - min) / (max - min)) * 100))
    : 0;
  const sliderStyle = { "--timeline-progress": `${progressPercent}%` } as CSSProperties;

  useEffect(() => {
    currentMinutesRef.current = currentMinutes;
  }, [currentMinutes]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      const nextMinutes = advanceTimeline(currentMinutesRef.current, 1, min, max);
      currentMinutesRef.current = nextMinutes;
      setCurrentMinutes(nextMinutes);
    }, BASE_PLAYBACK_INTERVAL_MS / playbackSpeed);

    return () => window.clearInterval(timer);
  }, [playing, playbackSpeed, min, max, setCurrentMinutes]);

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextMinutes = Number(event.target.value);
    setPlaying(false);
    currentMinutesRef.current = nextMinutes;
    setCurrentMinutes(nextMinutes);
  }

  function handleStep() {
    const nextMinutes = advanceTimeline(currentMinutes, PLAYBACK_STEP_MINUTES, min, max);
    setPlaying(false);
    currentMinutesRef.current = nextMinutes;
    setCurrentMinutes(nextMinutes);
  }

  function jumpToMinute(minutes: number) {
    setPlaying(false);
    currentMinutesRef.current = minutes;
    setCurrentMinutes(minutes);
  }

  return (
    <div className="timeline-panel" aria-label="Forecast timeline controls">
      <div className="timeline-heading">
        <span>FORECAST TIMELINE</span>
        <span className="timeline-validity"><Clock3 size={13} /> 15 / 30 / 60 MIN FRAMES</span>
      </div>
      <div className="timeline-row">
        <PlaybackControls
          playing={playing}
          playbackSpeed={playbackSpeed}
          onToggle={() => setPlaying((value) => !value)}
          onStep={handleStep}
          onSpeedChange={setPlaybackSpeed}
        />
        <div className="timeline-track-wrap">
          <div className="timeline-labels">
            {TIMELINE_MARKERS.map((minute) => (
              <button
                className={`timeline-marker ${currentMinutes === minute ? "active" : ""}`}
                type="button"
                key={minute}
                aria-label={`Jump to ${minute} minutes`}
                onClick={() => jumpToMinute(minute)}
              >
                {minute === 30 ? `CURRENT ${currentMinutes} MIN` : `${minute} MIN`}
              </button>
            ))}
          </div>
          <Slider
            aria-label="Forecast timeline"
            min={min}
            max={max}
            value={currentMinutes}
            style={sliderStyle}
            onChange={handleSliderChange}
          />
          <div className="timeline-ticks">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        </div>
        <div className="timeline-key"><span className="key-line" /> Modelled exposure area<span className="key-dash" /> Forecast uncertainty</div>
      </div>
    </div>
  );
}

export { advanceTimeline };
