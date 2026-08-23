import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  indicator?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  showChevron?: boolean;
}

export function MobileListItem({
  title,
  subtitle,
  badge,
  indicator,
  action,
  onClick,
  href,
  className,
  showChevron,
}: MobileListItemProps) {
  const isLink = !!href;
  const Component = isLink ? "a" : "div";
  
  return (
    <Component
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        "bg-card border border-border/30",
        "transition-all duration-150 ease-out",
        "press-subtle",
        (onClick || isLink) && "active:bg-accent/60 cursor-pointer",
        "animate-apple-slide-up",
        className,
      )}
      onClick={onClick}
      role={onClick && !isLink ? "button" : undefined}
      tabIndex={onClick && !isLink ? 0 : undefined}
    >
      {indicator && <div className="shrink-0">{indicator}</div>}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-medium truncate">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="text-[13px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      
      {action && <div className="shrink-0">{action}</div>}
      
      {(showChevron || isLink) && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
    </Component>
  );
}
