"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  FolderOpen,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/applications", label: "Apps", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/documents", label: "Files", icon: FolderOpen },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "border-t border-border/40",
        "bg-background/80 glass-blur",
        "safe-bottom",
        "transition-all duration-300",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      )}
    >
      <div className="flex h-[52px] items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5",
                "min-w-[56px] h-full px-2 py-1",
                "rounded-xl",
                "transition-all duration-200 ease-out",
                "press-subtle",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Pill indicator */}
              {isActive && mounted && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-primary tab-pill-active" />
              )}
              
              <item.icon
                className={cn(
                  "h-[22px] w-[22px] transition-all duration-200",
                  isActive && "text-primary"
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              
              <span
                className={cn(
                  "text-[10px] leading-tight transition-all duration-200",
                  isActive
                    ? "font-semibold text-primary"
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
