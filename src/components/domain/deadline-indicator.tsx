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
  overdue: { 
    icon: AlertTriangle, 
    bg: "bg-red-50 dark:bg-red-900/30", 
    text: "text-red-600 dark:text-red-400",
    label: "Overdue" 
  },
  urgent: { 
    icon: Clock, 
    bg: "bg-amber-50 dark:bg-amber-900/30", 
    text: "text-amber-600 dark:text-amber-400",
    label: "Urgent" 
  },
  soon: { 
    icon: Clock, 
    bg: "bg-blue-50 dark:bg-blue-900/30", 
    text: "text-blue-600 dark:text-blue-400",
    label: "Soon" 
  },
  normal: { 
    icon: Clock, 
    bg: "bg-gray-50 dark:bg-gray-800/30", 
    text: "text-muted-foreground",
    label: "" 
  },
};

export function DeadlineIndicator({ dueAt, completed, className }: DeadlineIndicatorProps) {
  if (completed) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        "text-emerald-600 dark:text-emerald-400",
        "bg-emerald-50 dark:bg-emerald-900/30",
        "rounded-full px-2 py-0.5",
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

  const label =
    days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Today"
        : days === 1
          ? "Tomorrow"
          : `${days}d`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        config.text,
        config.bg,
        "rounded-full px-2 py-0.5",
        className
      )}
      role="status"
      aria-label={`${label} remaining`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
