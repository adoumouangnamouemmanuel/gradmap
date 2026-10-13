import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 sm:mb-6 animate-content-enter", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
