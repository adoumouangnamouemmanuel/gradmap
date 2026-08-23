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

  React.useEffect(() => {
    if (open) {
      setQuery(""); setResults([]); setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onOpenChange(!open); }
      if (e.key === "Escape" && open) onOpenChange(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!query || query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try { setResults(await globalSearch(query)); setSelectedIndex(0); } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) { e.preventDefault(); navigateTo(results[selectedIndex]); }
  }

  function navigateTo(result: SearchResult) {
    onOpenChange(false);
    router.push(result.href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[20vh] sm:pt-[15vh]">
      <div className="fixed inset-0 bg-black/40 glass-blur animate-overlay-in" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-[20px] border border-border/30 bg-card shadow-elevation-3 animate-scale-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/30 px-4 h-[52px]">
          {loading ? <Loader2 className="h-[18px] w-[18px] shrink-0 text-muted-foreground animate-spin" /> : <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground/50" />}
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search everything..."
            className="flex-1 bg-transparent text-[16px] placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button onClick={() => onOpenChange(false)} className="rounded-full p-2 hover:bg-accent press-apple">
            <X className="h-[16px] w-[16px] text-muted-foreground/50" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2 scroll-ios">
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="py-8 text-center text-[14px] text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          )}
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => navigateTo(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left",
                "transition-colors duration-100 press-subtle",
                index === selectedIndex ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-primary/[0.08] text-primary/60">
                {typeIcons[result.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium truncate">{result.title}</p>
                <p className="text-[13px] text-muted-foreground truncate">{result.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-[2px] text-[10px] font-medium text-muted-foreground capitalize">
                {result.type}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 px-4 py-2.5">
          <p className="text-[11px] text-muted-foreground/40">
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd> select ·{" "}
            <kbd className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">esc</kbd> close
          </p>
        </div>
      </div>
    </div>
  );
}
