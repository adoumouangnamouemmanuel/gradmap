"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Award,
  Building2,
  BookOpen,
  GraduationCap,
  X,
  Loader2,
  Users,
  PenTool,
  ClipboardList,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchType, type SearchResult } from "@/features/search/actions";

const typeConfig: Record<SearchType, { icon: React.ReactNode; label: string; color: string }> = {
  program: {
    icon: <GraduationCap className="h-[18px] w-[18px]" />,
    label: "Program",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  scholarship: {
    icon: <Award className="h-[18px] w-[18px]" />,
    label: "Scholarship",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  institution: {
    icon: <Building2 className="h-[18px] w-[18px]" />,
    label: "Institution",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  application: {
    icon: <FileText className="h-[18px] w-[18px]" />,
    label: "Application",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  document: {
    icon: <FileText className="h-[18px] w-[18px]" />,
    label: "Document",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
  essay: {
    icon: <PenTool className="h-[18px] w-[18px]" />,
    label: "Essay",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  contact: {
    icon: <Users className="h-[18px] w-[18px]" />,
    label: "Contact",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  recommender: {
    icon: <Users className="h-[18px] w-[18px]" />,
    label: "Recommender",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  task: {
    icon: <ClipboardList className="h-[18px] w-[18px]" />,
    label: "Task",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  deadline: {
    icon: <CalendarDays className="h-[18px] w-[18px]" />,
    label: "Deadline",
    color: "bg-red-500/10 text-red-500 dark:text-red-400",
  },
  expense: {
    icon: <DollarSign className="h-[18px] w-[18px]" />,
    label: "Expense",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
};

// Group results by type for cleaner display
function groupResults(results: SearchResult[]) {
  const groups: { type: SearchType; label: string; items: SearchResult[] }[] = [];

  for (const r of results) {
    let group = groups.find((candidate) => candidate.type === r.type);
    if (!group) {
      group = {
        type: r.type,
        label: typeConfig[r.type]?.label || r.type,
        items: [],
      };
      groups.push(group);
    }
    group.items.push(r);
  }

  return groups;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cmd+K listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await globalSearch(query));
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex]);
    }
  }

  function navigateTo(result: SearchResult) {
    onOpenChange(false);
    router.push(result.href);
  }

  // Auto-scroll selected item into view
  React.useEffect(() => {
    const el = document.getElementById(`search-result-${selectedIndex}`);
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  if (!open) return null;

  const groups = groupResults(results);
  const flatResults = results;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="glass-blur animate-overlay-in fixed inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Mobile: full-screen bottom sheet */}
      <div className="fixed inset-x-0 top-0 bottom-0 sm:static sm:flex sm:items-start sm:justify-center sm:px-4 sm:pt-[12vh]">
        <div
          className={cn(
            "relative z-[101] w-full sm:max-w-lg",
            "bg-card sm:border-border/30 sm:shadow-elevation-3 sm:rounded-[20px] sm:border",
            "flex flex-col",
            "animate-scale-in",
            // Mobile: full screen sheet
            "h-full sm:h-auto sm:max-h-[75vh]",
            // Safe area on mobile
            "safe-bottom",
          )}
        >
          {/* Search input — sticky at top */}
          <div className="border-border/30 flex h-[56px] shrink-0 items-center gap-3 border-b px-4">
            {loading ? (
              <Loader2 className="text-muted-foreground h-[20px] w-[20px] shrink-0 animate-spin" />
            ) : (
              <Search className="text-muted-foreground/40 h-[20px] w-[20px] shrink-0" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search everything..."
              className="placeholder:text-muted-foreground/35 flex-1 bg-transparent text-[17px] focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="hover:bg-accent press-apple rounded-full p-1.5"
              >
                <X className="text-muted-foreground/40 h-[16px] w-[16px]" />
              </button>
            )}
          </div>

          {/* Results — scrollable */}
          <div ref={scrollRef} className="scroll-ios flex-1 overflow-y-auto overscroll-contain">
            {/* Empty state */}
            {!query && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="bg-primary/[0.06] text-primary/40 mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-[14px]">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-muted-foreground text-[15px] font-medium">
                  Search your grad school data
                </p>
                <p className="text-muted-foreground/60 mt-1 max-w-[240px] text-[13px]">
                  Programs, scholarships, contacts, essays, deadlines — everything in one place.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            )}

            {/* No results */}
            {query.trim().length >= 2 && !loading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-muted-foreground text-[15px]">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-muted-foreground/50 mt-1 text-[13px]">
                  Try a different search term.
                </p>
              </div>
            )}

            {/* Grouped results */}
            {!loading && groups.length > 0 && (
              <div className="p-2">
                {groups.map((group) => (
                  <div key={group.type} className="mb-1">
                    {/* Section header */}
                    <p className="text-muted-foreground/40 px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                      {group.label}
                      {group.items.length > 1 ? "s" : ""}
                    </p>
                    {group.items.map((result) => {
                      const globalIdx = flatResults.indexOf(result);
                      const config = typeConfig[result.type];
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          id={`search-result-${globalIdx}`}
                          onClick={() => navigateTo(result)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left",
                            "press-subtle transition-colors duration-100",
                            "min-h-[52px]",
                            globalIdx === selectedIndex ? "bg-accent" : "hover:bg-accent/50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px]",
                              config?.color || "bg-muted text-muted-foreground",
                            )}
                          >
                            {config?.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-medium">{result.title}</p>
                            <p className="text-muted-foreground truncate text-[13px]">
                              {result.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — desktop only */}
          <div className="border-border/30 hidden shrink-0 border-t px-4 py-2 sm:block">
            <p className="text-muted-foreground/35 text-[11px]">
              <kbd className="bg-muted/50 rounded px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>{" "}
              navigate ·{" "}
              <kbd className="bg-muted/50 rounded px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>{" "}
              select ·{" "}
              <kbd className="bg-muted/50 rounded px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>{" "}
              close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
