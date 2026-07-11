import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "icon" | "danger" };

export function Button({ className, variant = "ghost", ...props }: ButtonProps) {
  return <button className={cn("ui-button", `ui-button--${variant}`, className)} {...props} />;
}
