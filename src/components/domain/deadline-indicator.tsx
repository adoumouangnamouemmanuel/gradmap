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
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgency(days: number): "overdue" | "urgent" | "soon" | "normal" {
  if (days < 0) return "overdue";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "normal";
}

const urgencyConfig = {
  overdue: { icon: AlertTriangle, text: "text-red-500", bg: "bg-red-50 dark:bg-red-900/25" },
  urgent: { icon: Clock, text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/25" },
  soon: { icon: Clock, text: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/25" },
  normal: { icon: Clock, text: "text-muted-foreground", bg: "bg-muted" },
};

export function DeadlineIndicator({ dueAt, completed, className }: DeadlineIndicatorProps) {
  if (completed) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/25 dark:text-emerald-400",
        "rounded-full px-2 py-[2px]",
        className
      )}>
        <CheckCircle className="h-3 w-3" />
        Done
      </span>
    );
  }

  const days = getDaysUntil(dueAt);
  const urgency = getUrgency(days);
  const config = urgencyConfig[urgency];
  const Icon = config.icon;
  const label = days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : days === 1 ? "Tmrw" : `${days}d`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        config.text, config.bg,
        "rounded-full px-2 py-[2px]",
        className
      )}
      role="status"
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
