import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      {...props}
    />
  );
}

/** Pre-built skeleton for list items */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
      <Skeleton className="h-10 w-10 rounded-[12px] shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-[14px] w-[60%] rounded-md" />
        <Skeleton className="h-[11px] w-[40%] rounded-md" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full shrink-0" />
    </div>
  );
}

/** Pre-built skeleton for cards */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[16px] border border-border/30 bg-card p-5 space-y-3", className)}>
      <Skeleton className="h-[16px] w-[40%] rounded-md" />
      <Skeleton className="h-[14px] w-[80%] rounded-md" />
      <Skeleton className="h-[14px] w-[60%] rounded-md" />
    </div>
  );
}

export { Skeleton, SkeletonListItem, SkeletonCard };
