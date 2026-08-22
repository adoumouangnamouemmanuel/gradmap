import * as React from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineIndicatorProps {
  dueAt: Date | string;
  completed?: boolean;
  className?: string;
}

function getDaysUntil(dueAt: Date | string): number {
  const now = new Date();
  const due = new Date(dueAt);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgency(days: number): "overdue" | "urgent" | "soon" | "normal" {
  if (days < 0) return "overdue";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "normal";
}

const urgencyConfig = {
  overdue: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", label: "Overdue" },
  urgent: { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "Urgent" },
  soon: { icon: Clock, color: "text-blue-600 dark:text-blue-400", label: "Soon" },
  normal: { icon: Clock, color: "text-muted-foreground", label: "" },
};

export function DeadlineIndicator({ dueAt, completed, className }: DeadlineIndicatorProps) {
  if (completed) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400", className)}>
        <CheckCircle className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  const days = getDaysUntil(dueAt);
  const urgency = getUrgency(days);
  const config = urgencyConfig[urgency];
  const Icon = config.icon;

  const label =
    days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Due today"
        : days === 1
          ? "Due tomorrow"
          : `${days}d remaining`;

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs font-medium", config.color, className)}
      role="status"
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
