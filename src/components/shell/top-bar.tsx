"use client";

import * as React from "react";
import { Search, CalendarDays, Menu, User, Settings, LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";

interface TopBarProps {
  onMenuToggle?: () => void;
  onSearchOpen?: () => void;
}

export function TopBar({ onMenuToggle, onSearchOpen }: TopBarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const section = pathname.split("/")[1]?.replaceAll("-", " ") || "Workspace";

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
        "app-topbar sticky top-0 z-30 flex h-[64px] shrink-0 items-center gap-3 px-4",
        "transition-all duration-300 ease-out",
        scrolled
          ? "border-border/40 bg-background/85 glass-blur shadow-elevation-1 border-b"
          : "bg-background/60 border-b border-transparent",
        "lg:h-[72px] lg:gap-5 lg:px-8",
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="press-apple h-10 w-10 rounded-full lg:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </Button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="press-apple lg:hidden">
        <div className="flex items-center gap-2">
          <div className="shadow-elevation-1 flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]">
            <LogoMark className="text-primary h-6 w-6" />
          </div>
          <span className="text-[16px] font-semibold tracking-tight">GradMap</span>
        </div>
      </Link>

      <div className="hidden min-w-[130px] lg:block">
        <p className="text-sm font-semibold capitalize">
          {section === "dashboard" ? "Overview" : section}
        </p>
        <p className="text-muted-foreground mt-1 text-[11px]">Your personal workspace</p>
      </div>
      {/* Desktop search bar */}
      <div className="hidden max-w-[340px] flex-1 lg:flex">
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchOpen}
          className="text-muted-foreground hover:bg-accent/50 hover:text-foreground bg-muted/65 h-10 w-full justify-start gap-3 rounded-2xl border-transparent px-4 shadow-none transition-all"
        >
          <Search className="text-muted-foreground/60 h-4 w-4 shrink-0" />
          <span className="flex-1 text-left text-[14px] font-normal">Search your workspace</span>
          <kbd className="bg-muted/50 text-muted-foreground/60 pointer-events-none inline-flex h-5 items-center gap-1 rounded-md px-1.5 font-mono text-[10px] font-medium select-none">
            Ctrl K
          </kbd>
        </Button>
      </div>

      {/* Mobile search */}
      <Button
        variant="ghost"
        size="icon"
        className="press-apple h-10 w-10 rounded-full lg:hidden"
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
        asChild
        className="press-apple relative h-10 w-10 rounded-full"
      >
        <Link href="/calendar" aria-label="Open deadlines">
          <CalendarDays className="h-[20px] w-[20px]" strokeWidth={1.8} />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open profile menu"
            className="bg-primary/10 text-primary hover:bg-primary/20 h-10 w-10 rounded-2xl"
          >
            <User size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-56 p-2">
          <DropdownMenuLabel className="px-3 py-2">
            <span className="block text-sm font-semibold">Your workspace</span>
            <span className="text-muted-foreground mt-0.5 block text-xs font-normal">
              Account and preferences
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5">
            <Link href="/settings/profile">
              <User />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5">
            <Link href="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout} className="p-0">
            <button
              type="submit"
              className="text-destructive hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none"
            >
              <LogOut className="size-4 shrink-0" />
              Sign out
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle */}
      <div className="rounded-full">
        <ThemeToggle />
      </div>
    </header>
  );
}
