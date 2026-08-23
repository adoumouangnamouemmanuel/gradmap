"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle?: () => void;
  onSearchOpen?: () => void;
}

export function TopBar({ onMenuToggle, onSearchOpen }: TopBarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const handleScroll = () => setScrolled(main.scrollTop > 4);
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[52px] items-center gap-3 px-3",
        "transition-all duration-300 ease-out",
        scrolled
          ? "border-b border-border/40 bg-background/85 glass-blur shadow-elevation-1"
          : "border-b border-transparent bg-background/60",
        "lg:h-[56px] lg:gap-4 lg:border-b lg:border-border/40 lg:bg-background/85 lg:glass-blur lg:px-6"
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10 rounded-full press-apple"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </Button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="lg:hidden press-apple">
        <div className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] overflow-hidden shadow-elevation-1">
            <Image src="/logo.jpg" alt="GradMap" width={26} height={26} className="object-cover" />
          </div>
          <span className="font-serif text-[16px] font-semibold tracking-tight">GradMap</span>
        </div>
      </Link>

      {/* Desktop search bar */}
      <div className="hidden lg:flex flex-1 max-w-[480px]">
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchOpen}
          className="w-full justify-start gap-3 rounded-full text-muted-foreground hover:bg-accent/50 hover:text-foreground h-10 px-4 border-border/50 shadow-elevation-1 transition-all"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <span className="flex-1 text-left font-normal text-[14px]">Search programs, scholarships...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex-1 lg:hidden" />

      {/* Mobile search */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10 rounded-full press-apple"
        aria-label="Search"
        onClick={onSearchOpen}
      >
        <Search className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </Button>

      <div className="flex-1" />

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full press-apple"
      >
        <Bell className="h-[20px] w-[20px]" strokeWidth={1.8} />
        <span className="absolute right-[9px] top-[9px] h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-background" />
      </Button>

      {/* Theme toggle */}
      <div className="rounded-full">
        <ThemeToggle />
      </div>
    </header>
  );
}
