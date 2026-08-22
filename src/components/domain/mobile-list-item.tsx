import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  indicator?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  badge,
  indicator,
  action,
  onClick,
  className,
}: MobileListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors",
        onClick && "cursor-pointer hover:bg-accent/50",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {indicator && <div className="shrink-0">{indicator}</div>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
