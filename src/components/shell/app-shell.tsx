"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SearchDialog } from "@/components/domain/search-dialog";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [drawerState, setDrawerState] = React.useState<"closed" | "opening" | "open" | "closing">("closed");

  const openMenu = React.useCallback(() => {
    setMobileMenuOpen(true);
    setDrawerState("opening");
    // Trigger haptic
    if (navigator.vibrate) navigator.vibrate(5);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrawerState("open");
      });
    });
  }, []);

  const closeMenu = React.useCallback(() => {
    setDrawerState("closing");
    setTimeout(() => {
      setMobileMenuOpen(false);
      setDrawerState("closed");
    }, 350);
  }, []);

  const toggleMenu = React.useCallback(() => {
    if (mobileMenuOpen) closeMenu();
    else openMenu();
  }, [mobileMenuOpen, openMenu, closeMenu]);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex"
        />

        {/* Mobile drawer overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            "bg-black/40 glass-blur",
            drawerState === "closed" && "opacity-0 pointer-events-none",
            drawerState === "opening" && "animate-overlay-in pointer-events-auto",
            drawerState === "open" && "opacity-100 pointer-events-auto",
            drawerState === "closing" && "animate-overlay-out pointer-events-none",
          )}
          onClick={closeMenu}
        />

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 lg:hidden",
              "shadow-elevation-3",
              drawerState === "opening" && "animate-drawer-open",
              drawerState === "open" && "translate-x-0",
              drawerState === "closing" && "animate-drawer-close",
            )}
          >
            <AppSidebar
              onToggle={closeMenu}
              onNavSelect={closeMenu}
              className="w-[280px] max-w-[85vw]"
            />
          </div>
        )}

        {/* Search dialog */}
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onMenuToggle={toggleMenu}
            onSearchOpen={() => setSearchOpen(true)}
          />

          <main className="flex-1 overflow-y-auto pb-[84px] lg:pb-0 scroll-ios overscroll-contain">
            <div className="animate-content-enter">
              {children}
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    </TooltipProvider>
  );
}
