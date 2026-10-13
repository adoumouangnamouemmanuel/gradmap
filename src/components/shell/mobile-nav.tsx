"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  FolderOpen,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/applications", label: "Apply", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/documents", label: "Library", icon: FolderOpen },
  { href: "/institutions", label: "Schools", icon: Building2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "border-t border-border/30",
        "bg-background/80 glass-blur",
        "safe-bottom",
      )}
    >
      <div className="flex h-[50px] items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-[2px]",
                "flex-1 h-full px-1 py-1.5",
                "rounded-lg",
                "transition-colors duration-200",
                "-webkit-tap-highlight-color: transparent",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "flex items-center justify-center",
                isActive && "motion-safe:animate-icon-bounce"
              )}>
                <item.icon
                  className={cn(
                    "h-[24px] w-[24px] transition-all duration-200",
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                  fill="none"
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none transition-all duration-200",
                  isActive
                    ? "font-semibold"
                    : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
