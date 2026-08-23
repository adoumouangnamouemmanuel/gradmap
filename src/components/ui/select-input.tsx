import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-[44px] w-full appearance-none rounded-[12px] border border-border/50 bg-transparent px-4 py-3 pr-10",
            "text-[16px] leading-normal",
            "transition-all duration-200",
            "hover:border-border",
            "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-40",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40">
          <svg className="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
