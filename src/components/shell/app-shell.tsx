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
  const [drawerAnimating, setDrawerAnimating] = React.useState<"enter" | "exit" | null>(null);

  const openMenu = React.useCallback(() => {
    setMobileMenuOpen(true);
    setDrawerAnimating("enter");
    // Clean up animation class after it completes
    setTimeout(() => setDrawerAnimating(null), 400);
  }, []);

  const closeMenu = React.useCallback(() => {
    setDrawerAnimating("exit");
    setTimeout(() => {
      setMobileMenuOpen(false);
      setDrawerAnimating(null);
    }, 280);
  }, []);

  const toggleMenu = React.useCallback(() => {
    if (mobileMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
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

        {/* Mobile overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 lg:hidden",
            mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
            drawerAnimating === "enter" && "overlay-enter",
            drawerAnimating === "exit" && "overlay-exit",
            !drawerAnimating && (mobileMenuOpen ? "opacity-100" : "opacity-0")
          )}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Mobile sidebar drawer */}
        {mobileMenuOpen && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 lg:hidden",
              "shadow-2xl",
              drawerAnimating === "enter" && "drawer-enter",
              drawerAnimating === "exit" && "drawer-exit",
              !drawerAnimating && "translate-x-0"
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

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onMenuToggle={toggleMenu}
            onSearchOpen={() => setSearchOpen(true)}
          />

          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-ios overscroll-contain">
            <div className="animate-apple-fade">
              {children}
            </div>
          </main>

          {/* Mobile bottom nav */}
          <MobileNav />
        </div>
      </div>
    </TooltipProvider>
  );
}
