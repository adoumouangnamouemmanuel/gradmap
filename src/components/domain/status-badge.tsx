import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        exploring: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        attention: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        blocked: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      },
    },
    defaultVariants: {
      status: "exploring",
    },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  label?: string;
}

const statusIcons: Record<string, string> = {
  exploring: "○",
  preparing: "◐",
  submitted: "●",
  attention: "△",
  blocked: "✕",
  done: "✓",
  draft: "–",
};

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ status }), className)} {...props}>
      <span aria-hidden="true">{statusIcons[status ?? "exploring"]}</span>
      {label ?? status}
    </span>
  );
}
