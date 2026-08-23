import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-[15px]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]",
          "transition-all duration-150 ease-out",
          "placeholder:text-muted-foreground/50",
          "hover:bg-muted/50 hover:border-border",
          "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/10 focus-visible:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
