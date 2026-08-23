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
  index?: number;
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
  index = 0,
}: MobileListItemProps) {
  const isLink = !!href;
  const showChevronRight = showChevron ?? isLink;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 min-h-[44px]",
        "transition-colors duration-150",
        "border-b border-border/30 last:border-b-0",
        (onClick || isLink) && "cursor-pointer press-subtle active:bg-accent",
        className,
      )}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={onClick}
      role={onClick && !isLink ? "button" : undefined}
      tabIndex={onClick && !isLink ? 0 : undefined}
    >
      {/* Leading indicator/avatar */}
      {indicator && (
        <div className="shrink-0 self-center">{indicator}</div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {subtitle ? (
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-normal truncate">{title}</p>
            {badge}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-normal">{title}</p>
            {badge}
          </div>
        )}
        {subtitle && (
          <p className="text-[13px] text-muted-foreground truncate mt-[1px] leading-tight">{subtitle}</p>
        )}
      </div>

      {/* Trailing action or chevron */}
      {action && <div className="shrink-0 self-center">{action}</div>}
      {showChevronRight && !action && (
        <ChevronRight className="h-[14px] w-[14px] shrink-0 text-muted-foreground/30 self-center" />
      )}
    </div>
  );
}

/** iOS grouped list container */
export function GroupedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-[14px] bg-card border border-border/30 overflow-hidden",
      className,
    )}>
      {children}
    </div>
  );
}
