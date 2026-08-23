"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SearchDialog } from "@/components/domain/search-dialog";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

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
          className={
            `fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
              mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`
          }
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile sidebar drawer */}
        <div
          className={
            `fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out lg:hidden ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`
          }
        >
          <AppSidebar 
            onToggle={() => setMobileMenuOpen(false)} 
            onNavSelect={() => setMobileMenuOpen(false)}
            className="w-[260px] max-w-[80vw]" 
          />
        </div>

        {/* Search dialog */}
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            onSearchOpen={() => setSearchOpen(true)}
          />

          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {children}
          </main>

          {/* Mobile bottom nav */}
          <MobileNav />
        </div>
      </div>
    </TooltipProvider>
  );
}
