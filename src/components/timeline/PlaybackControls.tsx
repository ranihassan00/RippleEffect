"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SPEEDS = [0.5, 1, 1.5, 2] as const;
type PlaybackSpeed = (typeof SPEEDS)[number];

interface PlaybackControlsProps {
  playing: boolean;
  playbackSpeed: PlaybackSpeed;
  onToggle: () => void;
  onStep: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

export function PlaybackControls({ playing, playbackSpeed, onToggle, onStep, onSpeedChange }: PlaybackControlsProps) {
  const [speedOpen, setSpeedOpen] = useState(false);
  const [focusedSpeed, setFocusedSpeed] = useState(playbackSpeed);
  const speedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!speedRef.current?.contains(event.target as Node)) setSpeedOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSpeedOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectSpeed(speed: PlaybackSpeed) {
    onSpeedChange(speed);
    setFocusedSpeed(speed);
    setSpeedOpen(false);
  }

  function handleSpeedKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = SPEEDS.indexOf(focusedSpeed);
      const offset = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + offset + SPEEDS.length) % SPEEDS.length;
      setFocusedSpeed(SPEEDS[nextIndex]);
      setSpeedOpen(true);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && speedOpen) {
      event.preventDefault();
      selectSpeed(focusedSpeed);
    }
  }

  return (
    <div className="playback-controls">
      <Button variant="icon" aria-label={playing ? "Pause forecast" : "Play forecast"} onClick={onToggle}>
        {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
      </Button>
      <Button variant="icon" aria-label="Step forward forecast" onClick={onStep}>
        <SkipForward size={17} />
      </Button>
      <div className="playback-speed-wrap" ref={speedRef}>
        <button
          className="timeline-speed"
          type="button"
          aria-label="Change playback speed"
          aria-haspopup="listbox"
          aria-expanded={speedOpen}
          onClick={() => {
            setFocusedSpeed(playbackSpeed);
            setSpeedOpen((open) => !open);
          }}
          onKeyDown={handleSpeedKeyDown}
        >
          {playbackSpeed}× <ChevronDown size={11} aria-hidden="true" />
        </button>
        {speedOpen && (
          <div className="playback-speed-menu" role="listbox" aria-label="Playback speed">
            {SPEEDS.map((speed) => (
              <button
                className="playback-speed-option"
                type="button"
                role="option"
                aria-selected={speed === playbackSpeed}
                key={speed}
                onClick={() => selectSpeed(speed)}
                onMouseEnter={() => setFocusedSpeed(speed)}
              >
                {speed}×
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type { PlaybackSpeed };
