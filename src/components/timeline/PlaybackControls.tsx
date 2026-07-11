"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlaybackControls({ playing, onToggle, onStep }: { playing: boolean; onToggle: () => void; onStep: () => void }) {
  return <div className="playback-controls"><Button variant="icon" aria-label={playing ? "Pause forecast" : "Play forecast"} onClick={onToggle}>{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</Button><Button variant="icon" aria-label="Step forecast" onClick={onStep}><SkipForward size={17} /></Button><span>1×</span></div>;
}
