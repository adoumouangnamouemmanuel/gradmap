"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif font-bold text-xs">
            G
          </div>
          <span className="font-serif text-base font-semibold">GradMap</span>
        </div>
      </Link>

      {/* Search — left-aligned, capped width */}
      <div className="hidden lg:flex flex-1 max-w-[480px]">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search programs, scholarships...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex-1 lg:hidden" />

      {/* Mobile search */}
      <Button variant="ghost" size="icon" className="sm:hidden h-10 w-10" aria-label="Search">
        <Search className="h-5 w-5" />
      </Button>

      {/* Spacer for right-aligned actions */}
      <div className="flex-1" />

      {/* Notification bell with hover affordance */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full hover:bg-accent"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
      </Button>

      {/* Theme toggle with hover affordance */}
      <div className="rounded-full">
        <ThemeToggle />
      </div>
    </header>
  );
}
