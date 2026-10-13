"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SearchDialog } from "@/components/domain/search-dialog";
import { cn } from "@/lib/utils";
import { MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [drawerState, setDrawerState] = React.useState<"closed" | "opening" | "open" | "closing">(
    "closed",
  );

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
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <div className="app-frame flex h-dvh overflow-hidden">
          <a
            href="#main-content"
            className="focus:bg-card sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:p-3"
          >
            Skip to content
          </a>
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
              "glass-blur bg-black/40",
              drawerState === "closed" && "pointer-events-none opacity-0",
              drawerState === "opening" && "animate-overlay-in pointer-events-auto",
              drawerState === "open" && "pointer-events-auto opacity-100",
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
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopBar onMenuToggle={toggleMenu} onSearchOpen={() => setSearchOpen(true)} />

            <main
              id="main-content"
              tabIndex={-1}
              className="scroll-ios flex-1 overflow-y-auto overscroll-contain pb-[84px] lg:pb-0"
            >
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </main>

            <MobileNav />
          </div>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}
