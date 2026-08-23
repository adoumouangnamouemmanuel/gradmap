"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  FileText,
  Calendar,
  FolderOpen,
  Settings,
  Building2,
  PenTool,
  Users,
  ChevronLeft,
  LogOut,
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
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "WORKSPACE",
    items: [
      { href: "/institutions", label: "Institutions", icon: Building2 },
      { href: "/programs", label: "Programs", icon: BookOpen },
      { href: "/scholarships", label: "Scholarships", icon: Award },
      { href: "/applications", label: "Applications", icon: FileText },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "CONTENT",
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
}: {
  item: NavItemData;
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-all duration-200 ease-out",
        collapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "px-3",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground active:scale-[0.98]",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-md bg-primary" />
      )}
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {!collapsed && <span>{item.label}</span>}
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
}

export function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/60 text-sidebar-foreground",
        "transition-[width] duration-300 ease-[cubic-bezier(0.2,1,0.2,1)] shadow-[-1px_0_10px_rgba(0,0,0,0.02)_inset]",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* ── Logo row + collapse toggle ── */}
      <div className="relative flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm shadow-primary/20 ring-1 ring-primary/20 overflow-hidden">
          <Image src="/logo.jpg" alt="GradMap Logo" width={32} height={32} className="object-cover" />
        </div>
        <span
          className={cn(
            "font-serif text-lg font-semibold tracking-tight whitespace-nowrap overflow-hidden",
            "transition-all duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          GradMap
        </span>

        {/* Collapse toggle - circular, on the border edge */}
        <div className="absolute -right-[14px] top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              "border border-sidebar-border bg-background shadow-sm",
              "transition-all duration-200",
              "hover:bg-accent hover:shadow-md hover:scale-105 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
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
                      <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
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
                    isActive={pathname.startsWith(item.href)}
                    collapsed={collapsed}
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
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
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
                  className={cn(
                    "flex h-10 w-10 mx-auto items-center justify-center rounded-md",
                    "transition-all duration-200 ease-out cursor-pointer",
                    "hover:bg-sidebar-accent/50 active:scale-[0.98]",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      E
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" sideOffset={8} className="w-56 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        E
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Emmanuel</p>
                      <p className="text-xs text-muted-foreground truncate">
                        emmanuel@example.com
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
                      E
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Emmanuel</p>
                    <p className="text-xs text-muted-foreground truncate">
                      emmanuel@example.com
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
                        E
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Emmanuel</p>
                      <p className="text-xs text-muted-foreground truncate">
                        emmanuel@example.com
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
