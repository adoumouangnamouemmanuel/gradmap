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
  /** Shows chevron right arrow (default true when href provided) */
  showChevron?: boolean;
  /** Position in list for stagger animation delay */
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
        "grouped-list-item animate-list-item",
        (onClick || isLink) && "cursor-pointer press-subtle",
        className,
      )}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={onClick}
      role={onClick && !isLink ? "button" : undefined}
      tabIndex={onClick && !isLink ? 0 : undefined}
    >
      {/* Leading indicator/avatar */}
      {indicator && (
        <div className="shrink-0">{indicator}</div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-normal truncate">{title}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="text-[13px] text-muted-foreground truncate mt-[1px] leading-tight">{subtitle}</p>
        )}
      </div>

      {/* Trailing action or chevron */}
      {action && <div className="shrink-0">{action}</div>}
      {showChevronRight && !action && (
        <ChevronRight className="h-[14px] w-[14px] shrink-0 text-muted-foreground/30" />
      )}
    </div>
  );
}

/** iOS grouped list container */
export function GroupedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grouped-list", className)}>
      {children}
    </div>
  );
}
