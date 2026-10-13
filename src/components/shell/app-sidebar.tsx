"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Award,
  FileText,
  Calendar,
  FolderOpen,
  Settings,
  Building2,
  PenTool,
  Users,
  User,
  ChevronLeft,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/lib/auth/actions";

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

const bottomItems: NavItemData[] = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ── Tooltip wrapper that works correctly when collapsed ───────
// Radix Tooltip uses floating-ui which can miscalculate inside a
// shrinking sidebar.  We render our own positioned tooltip using
// getBoundingClientRect for pixel-perfect placement.

function CollapsedTooltip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={16} className="font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black">
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
        collapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-3",
        isActive
          ? "text-primary"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground motion-safe:hover:translate-x-1",
      )}
    >
      {isActive && (
        <motion.span layoutId={`${navigationId}-active-${collapsed ? "collapsed" : "expanded"}`} className="absolute inset-0 rounded-2xl bg-primary/10" transition={{ type: "spring", stiffness: 350, damping: 32 }} />
      )}
      <item.icon
        className={cn(
          "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
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

export function AppSidebar({ collapsed = false, onToggle, onNavSelect, className }: AppSidebarProps) {
  const pathname = usePathname();
  const navigationId = React.useId();

  return (
    <aside
      className={cn(
        "app-sidebar flex flex-col h-full border border-sidebar-border/50 bg-sidebar text-sidebar-foreground",
        "lg:rounded-[28px]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-[-1px_0_10px_rgba(0,0,0,0.02)_inset]",
        collapsed ? "w-[76px]" : "w-[238px]",
        className
      )}
    >
      {/* ── Logo row + collapse toggle ── */}
      <div className={cn("relative flex h-20 shrink-0 items-center gap-3", collapsed ? "px-3" : "px-5")}>
        <div className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Compass size={21} strokeWidth={1.8} />
        </div>
        <span
          className={cn(
            "text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden",
            "transition-all duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          GradMap
        </span>

        {/* Mobile close toggle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 lg:hidden">
          <button
            onClick={onToggle}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapse toggle - circular, on the border edge (desktop only) */}
        <div className="absolute -right-[14px] top-1/2 -translate-y-1/2 z-20 hidden lg:block">
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border border-border/80 bg-background shadow-md",
              "transition-all duration-200",
              "hover:bg-accent hover:shadow-lg hover:scale-105 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-foreground transition-transform duration-200",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <Separator className="bg-sidebar-border shrink-0" />

      {/* ── Scrollable nav area (flex-1, overflow-y) ── */}
      <div className="flex-1 overflow-y-auto py-2 min-h-0 scrollbar-thin">
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
                      <div className="mx-2 my-2 h-px bg-sidebar-border/60" />
                    ) : (
                      <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                        {group.label}
                      </span>
                    )}
                  </>
                )}
                {/* Separator after Dashboard group in collapsed mode */}
                {!isLabeled && !isFirstGroup && collapsed && gi === 1 && (
                  <div className="mx-2 my-2 h-px bg-sidebar-border/60" />
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

      {/* ── Pinned bottom: Settings + divider + user footer ── */}
      <div className="shrink-0 flex flex-col">
        <Separator className="bg-sidebar-border" />

        {/* Settings nav */}
        <nav className="flex flex-col gap-1 px-2 py-2">
          {bottomItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              navigationId={navigationId}
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
              onClick={onNavSelect}
            />
          ))}
        </nav>

        {/* Deliberate divider before user */}
        <div className="mx-3 h-px bg-sidebar-border/60" />

        {/* User footer - single hoverable block */}
        <div className="px-2 py-2">
          {collapsed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Account menu"
                  className={cn(
                    "flex h-10 w-10 mx-auto items-center justify-center rounded-md",
                    "transition-all duration-200 ease-out cursor-pointer",
                    "hover:bg-sidebar-accent/50 active:scale-[0.98]",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      <User className="h-4 w-4" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" sideOffset={8} className="w-56 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Your workspace</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Personal workspace
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <form action={logout}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2",
                    "transition-all duration-200 ease-out cursor-pointer text-left",
                    "hover:bg-sidebar-accent/50 active:scale-[0.98]",
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      <User className="h-4 w-4" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Your workspace</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Personal workspace
                    </p>
                  </div>
                  <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" sideOffset={8} className="w-56 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Your workspace</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Personal workspace
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <form action={logout}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </aside>
  );
}
