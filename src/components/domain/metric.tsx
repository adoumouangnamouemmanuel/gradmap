import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function Metric({ label, value, description, className }: MetricProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl font-semibold tracking-tight">{value}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
