import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-[9px] py-[2px] text-[11px] font-medium leading-normal",
  {
    variants: {
      status: {
        exploring: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
        preparing: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        submitted: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        attention: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        blocked: "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400",
        done: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        draft: "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400",
      },
    },
    defaultVariants: { status: "exploring" },
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
      <span aria-hidden="true" className="text-[7px] leading-none">{statusIcons[status ?? "exploring"]}</span>
      {label ?? status}
    </span>
  );
}
