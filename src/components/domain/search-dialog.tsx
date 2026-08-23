"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Award, Building2, BookOpen, GraduationCap, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResult } from "@/features/search/actions";

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  program: <GraduationCap className="h-4 w-4" />,
  scholarship: <Award className="h-4 w-4" />,
  institution: <Building2 className="h-4 w-4" />,
  application: <FileText className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  essay: <BookOpen className="h-4 w-4" />,
};

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Cmd+K listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
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
        const data = await globalSearch(query);
        setResults(data);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      }
      setLoading(false);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[20vh] sm:pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm overlay-enter"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-apple-scale overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4">
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search programs, scholarships, institutions..."
            className="flex h-12 w-full bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 hover:bg-accent press-apple"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 scroll-ios">
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="py-8 text-center text-[14px] text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => navigateTo(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-100",
                "press-subtle",
                index === selectedIndex ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-lg rounded-xl bg-muted/60 text-muted-foreground">
                {typeIcons[result.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium truncate">{result.title}</p>
                <p className="text-[12px] text-muted-foreground truncate">{result.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                {result.type}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border/40 px-4 py-2.5">
          <p className="text-[11px] text-muted-foreground/60">
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> select ·{" "}
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> close
          </p>
        </div>
      </div>
    </div>
  );
}
