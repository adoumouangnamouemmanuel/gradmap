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
        "flex flex-col items-center justify-center py-16 sm:py-20 text-center",
        "animate-content-enter",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-primary/[0.08] text-primary/60">
          {icon}
        </div>
      )}
      <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-[260px] text-[14px] text-muted-foreground leading-relaxed">{description}</p>
      {action?.href && (
        <Button asChild className="mt-6 rounded-full px-6 shadow-elevation-1 hidden sm:inline-flex">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
