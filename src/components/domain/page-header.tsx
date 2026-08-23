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
    <div className={cn("mb-6 sm:mb-8 animate-apple-fade", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[28px] sm:text-3xl font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-[14px] text-muted-foreground tracking-tight leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
      {children && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  );
}
