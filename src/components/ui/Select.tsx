import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/ui";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("ui-select", className)} {...props} />;
}
