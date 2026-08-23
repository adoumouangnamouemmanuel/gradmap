import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2rem]/[2.25rem]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0 mt-1">
            {action}
          </div>
        )}
      </div>
      {children && (
        <div className="w-full">
          {children}
        </div>
      )}
    </div>
  );
}
