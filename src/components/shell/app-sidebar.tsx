"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  FileText,
  Calendar,
  FolderOpen,
  Building2,
  PenTool,
  Users,
  ChevronLeft,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ── Data ──────────────────────────────────────────────────────

interface NavItemData {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label?: string;
  items: NavItemData[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "WORKSPACE",
    items: [
      { href: "/applications", label: "Applications", icon: FileText },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/programs", label: "Explore programs", icon: BookOpen },
      { href: "/institutions", label: "Institutions", icon: Building2 },
      { href: "/scholarships", label: "Funding", icon: Award },
    ],
  },
  {
    label: "LIBRARY",
    items: [
      { href: "/documents", label: "Documents", icon: FolderOpen },
      { href: "/essays", label: "Essays", icon: PenTool },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      { href: "/recommenders", label: "Recommenders", icon: Users },
      { href: "/contacts", label: "Contacts", icon: Users },
    ],
  },
];

// ── Tooltip wrapper that works correctly when collapsed ───────
// Radix Tooltip uses floating-ui which can miscalculate inside a
// shrinking sidebar.  We render our own positioned tooltip using
// getBoundingClientRect for pixel-perfect placement.

function CollapsedTooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={16}
        className="bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-black"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Single nav link ───────────────────────────────────────────

function NavItemLink({
  item,
  isActive,
  collapsed,
  onClick,
  navigationId,
}: {
  item: NavItemData;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
  navigationId: string;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "sidebar-link group relative flex items-center gap-3 rounded-2xl py-2.5 text-sm font-medium transition-all duration-300",
        collapsed ? "mx-auto h-10 w-10 justify-center px-0" : "px-3",
        isActive
          ? "text-primary"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground motion-safe:hover:translate-x-1",
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`${navigationId}-active-${collapsed ? "collapsed" : "expanded"}`}
          className="bg-primary/10 absolute inset-0 rounded-2xl"
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
        />
      )}
      <item.icon
        className={cn(
          "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {!collapsed && <span className="relative z-10">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return <CollapsedTooltip label={item.label}>{link}</CollapsedTooltip>;
  }

  return link;
}

// ── Main sidebar ──────────────────────────────────────────────

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavSelect?: () => void;
  className?: string;
}

export function AppSidebar({
  collapsed = false,
  onToggle,
  onNavSelect,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();
  const navigationId = React.useId();

  return (
    <aside
      className={cn(
        "app-sidebar border-sidebar-border/50 bg-sidebar text-sidebar-foreground flex h-full flex-col border",
        "lg:rounded-[28px]",
        "shadow-[-1px_0_10px_rgba(0,0,0,0.02)_inset] transition-[width] duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]",
        collapsed ? "w-[76px]" : "w-[238px]",
        className,
      )}
    >
      {/* ── Logo row + collapse toggle ── */}
      <div
        className={cn(
          "relative flex h-20 shrink-0 items-center gap-3",
          collapsed ? "px-3" : "px-5",
        )}
      >
        <div className="brand-mark bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl p-2">
          <LogoMark className="h-full w-full" />
        </div>
        <span
          className={cn(
            "overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap",
            "transition-all duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          GradMap
        </span>

        {/* Mobile close toggle */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 lg:hidden">
          <button
            onClick={onToggle}
            aria-label="Close sidebar"
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapse toggle - circular, on the border edge (desktop only) */}
        <div className="absolute top-1/2 -right-[14px] z-20 hidden -translate-y-1/2 lg:block">
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border-border/80 bg-background border shadow-md",
              "transition-all duration-200",
              "hover:bg-accent hover:scale-105 hover:shadow-lg active:scale-95",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            <ChevronLeft
              className={cn(
                "text-foreground h-4 w-4 transition-transform duration-200",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <Separator className="bg-sidebar-border shrink-0" />

      {/* ── Scrollable nav area (flex-1, overflow-y) ── */}
      <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navGroups.map((group, gi) => {
            const isFirstGroup = gi === 0;
            const isLabeled = !!group.label;
            return (
              <React.Fragment key={gi}>
                {/* Group label (expanded) or divider (collapsed) */}
                {isLabeled && !isFirstGroup && (
                  <>
                    {collapsed ? (
                      <div className="bg-sidebar-border/60 mx-2 my-2 h-px" />
                    ) : (
                      <span className="text-sidebar-foreground/60 px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase">
                        {group.label}
                      </span>
                    )}
                  </>
                )}
                {/* Separator after Dashboard group in collapsed mode */}
                {!isLabeled && !isFirstGroup && collapsed && gi === 1 && (
                  <div className="bg-sidebar-border/60 mx-2 my-2 h-px" />
                )}
                {group.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    navigationId={navigationId}
                    isActive={pathname.startsWith(item.href)}
                    collapsed={collapsed}
                    onClick={onNavSelect}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
