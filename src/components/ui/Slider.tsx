import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/ui";

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="range" className={cn("ui-slider", className)} {...props} />;
}
