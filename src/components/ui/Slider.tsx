import type { CSSProperties, InputHTMLAttributes } from "react";
import { cn } from "@/lib/ui";

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const min = Number(props.min ?? 0);
  const max = Number(props.max ?? 100);
  const value = Number(props.value ?? min);
  const progressPercent = max > min
    ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
    : 0;
  const style = { ...props.style, "--slider-progress": `${progressPercent}%` } as CSSProperties;

  return <input type="range" className={cn("ui-slider", className)} {...props} style={style} />;
}
