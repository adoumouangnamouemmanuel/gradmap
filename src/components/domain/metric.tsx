import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Metric({ label, value, description, icon, className }: MetricProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground/40">{icon}</span>}
        <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-[22px] font-semibold tracking-tight tabular-nums">{value}</p>
      {description && <p className="text-[12px] text-muted-foreground">{description}</p>}
    </div>
  );
}
