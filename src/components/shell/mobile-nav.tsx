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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-primary" />
              )}
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(isActive && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
