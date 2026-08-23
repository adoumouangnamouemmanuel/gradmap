import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 sm:py-16 text-center",
        "animate-apple-fade",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground animate-apple-scale">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-[280px] text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action?.href && (
        <Button asChild className="mt-5 hidden sm:inline-flex rounded-full px-6 shadow-sm">
          <Link href={action.href}>
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
