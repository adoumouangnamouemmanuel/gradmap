"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  CalendarDays,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageNavigation } from "@/components/ui/page-navigation";
import { pageBounds } from "@/lib/pagination";
import { SearchSelect } from "@/components/ui/search-select";
import { cn } from "@/lib/utils";
import { applicationLabel, type EntryChoices } from "@/features/entries/choices";
import { dateKey, monthDays, moveMonth } from "./dates";
import { getPlanningData, setPlanningComplete } from "./actions";
import type { PlanningData, PlanningItem, PlanningKind } from "./types";

const kindNames: Record<PlanningKind, string> = {
  deadline: "Deadlines",
  task: "Tasks",
  recommendation: "Recommendations",
  document: "Documents",
};
const kindClasses: Record<PlanningKind, string> = {
  deadline: "bg-primary/12 text-primary",
  task: "bg-success/10 text-success",
  recommendation: "bg-warning/15 text-foreground",
  document: "bg-info/12 text-info",
};

export function CalendarWorkspace({
  initial,
  initialMonth,
  today,
  choices,
  initialApplication = "",
}: {
  initialApplication?: string;
  initial: PlanningData;
  initialMonth: string;
  today: string;
  choices: EntryChoices;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(today);
  const [data, setData] = useState(initial);
  const [dataMonth, setDataMonth] = useState(initialMonth);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"month" | "agenda">("month");
  const [kind, setKind] = useState("all");
  const [application, setApplication] = useState(initialApplication);
  const [includeFinished, setIncludeFinished] = useState(false);
  const [saving, setSaving] = useState("");
  const [undatedPage, setUndatedPage] = useState(1);
  const sequence = useRef(0);
  const days = monthDays(month);
  const items = data.items.filter(
    (item) =>
      (includeFinished || !item.completed) &&
      (kind === "all" || item.kind === kind) &&
      (!application || item.applicationId === application),
  );
  const dated = items
    .filter(
      (item) =>
        item.dueAt &&
        dateKey(item.dueAt, choices.timezone) >= days[0] &&
        dateKey(item.dueAt, choices.timezone) <= days[41],
    )
    .sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || ""));
  const grouped = new Map<string, PlanningItem[]>();
  for (const item of dated) {
    const key = dateKey(item.dueAt!, choices.timezone);
    const group = grouped.get(key); if (group) group.push(item); else grouped.set(key, [item]);
  }
  const selectedItems = grouped.get(selected) || [];
  const undated = items.filter((item) => !item.dueAt);
  const undatedBounds = pageBounds(undated.length, undatedPage, 5);
  async function load(next: string) {
    if (next < "2020-01" || next > "2050-12") return;
    const request = ++sequence.current;
    setMonth(next);
    setPending(true);
    setError("");
    try {
      const result = await getPlanningData(next);
      if (request === sequence.current) {
        setData(result);
        setDataMonth(next);
      }
    } catch {
      if (request === sequence.current)
        setError("Your calendar couldn’t load. Your saved records are unchanged. Try again.");
    } finally {
      if (request === sequence.current) setPending(false);
    }
  }
  async function toggle(item: PlanningItem) {
    if (item.kind !== "deadline" && item.kind !== "task") return;
    setSaving(item.id);
    setError("");
    try {
      const result = await setPlanningComplete(item.kind, item.id, !item.completed);
      if (result.error) setError(result.error);
      else await load(month);
    } catch {
      setError("This item couldn’t save. Please try again.");
    } finally {
      setSaving("");
    }
  }
  const contextSuffix = application ? `&application=${encodeURIComponent(application)}` : "";
  function row(item: PlanningItem) {
    const label = item.applicationId
      ? choices.applications.find((current) => current.id === item.applicationId)
      : undefined;
    return (
      <div
        key={`${item.kind}-${item.id}`}
        className="border-border/50 bg-card rounded-2xl border p-4"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={cn("rounded-lg px-2 py-1 text-[11px] font-medium", kindClasses[item.kind])}
          >
            {kindNames[item.kind]}
          </span>
          <span className="text-muted-foreground text-xs">{item.status}</span>
        </div>
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          {label ? applicationLabel(label, choices) : item.context}
        </p>
        {item.dueAt && (
          <p className="text-muted-foreground mt-2 text-xs">
            {new Date(item.dueAt).toLocaleString("en-GB", {
              timeZone: choices.timezone,
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {item.href && (
            <Link
              href={item.href}
              className="text-primary inline-flex items-center gap-1 text-xs font-medium"
            >
              Open context
              <ArrowUpRight size={13} />
            </Link>
          )}
          {["task", "deadline"].includes(item.kind) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!!saving}
              onClick={() => toggle(item)}
            >
              {saving === item.id ? "Saving…" : item.completed ? "Reopen" : "Complete"}
            </Button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="workspace-page">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">YOUR PLAN, IN ONE PLACE</p>
          <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Deadlines, tasks, document requirements and recommendation dates · {choices.timezone}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/calendar/new?kind=task${contextSuffix}`}>
              <Plus size={16} />
              Task
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/calendar/new?kind=deadline${contextSuffix}`}>
              <Plus size={16} />
              Deadline
            </Link>
          </Button>
        </div>
      </header>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <SearchSelect
            name="application_filter"
            label="Calendar application"
            options={[
              { value: "", label: "All applications & general work" },
              ...choices.applications.map((item) => ({
                value: item.id,
                label: applicationLabel(item, choices),
              })),
            ]}
            value={application}
            onChange={(value) => setApplication(String(value))}
          />
        </div>
        <select
          aria-label="Filter calendar item type"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="bg-card h-12 rounded-2xl border px-3 text-sm"
        >
          <option value="all">All types</option>
          {Object.entries(kindNames).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeFinished}
            onChange={(event) => setIncludeFinished(event.target.checked)}
          />
          Include finished
        </label>
      </div>
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm"
        >
          {error}
          <Button variant="outline" size="sm" onClick={() => load(month)}>
            Retry
          </Button>
        </div>
      )}
      {data.truncated && (
        <p role="status" className="text-muted-foreground mb-4 text-sm">
          This view has reached its item limit. Open the linked workspaces to see additional
          records.
        </p>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="workspace-panel min-w-0 overflow-hidden p-4 sm:p-6" aria-busy={pending}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Previous month"
                disabled={month === "2020-01"}
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = moveMonth(month, -1);
                  setSelected(`${next}-01`);
                  load(next);
                }}
              >
                <ChevronLeft />
              </Button>
              <h2 className="min-w-[150px] text-lg font-semibold">
                {new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <Button
                aria-label="Next month"
                disabled={month === "2050-12"}
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = moveMonth(month, 1);
                  setSelected(`${next}-01`);
                  load(next);
                }}
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelected(today);
                  load(today.slice(0, 7));
                }}
              >
                Today
              </Button>
              <div role="group" aria-label="Calendar view" className="bg-muted flex rounded-xl p-1">
                {(["month", "agenda"] as const).map((value) => (
                  <button
                    key={value}
                    aria-label={`${value} view`}
                    aria-pressed={view === value}
                    onClick={() => setView(value)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      view === value && "bg-card text-primary",
                    )}
                  >
                    {value === "month" ? <CalendarDays size={17} /> : <List size={17} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {pending && (
            <p role="status" className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
              <Loader2 className="animate-spin" size={15} />
              Loading this month…
            </p>
          )}
          <div className="sm:hidden">
            <p className="text-muted-foreground mb-3 text-xs">
              Tap a date for its full agenda below.
            </p>
          </div>
          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day} className="text-muted-foreground py-3 text-xs font-medium">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 overflow-hidden rounded-2xl border">
                {days.map((day) => {
                  const matches = pending || dataMonth !== month ? [] : grouped.get(day) || [];
                  return (
                    <button
                      key={day}
                      id={`calendar-date-${day}`}
                      type="button"
                      aria-current={today === day ? "date" : undefined}
                      aria-label={`${day}, ${matches.length} items`}
                      aria-pressed={selected === day}
                      onClick={() => {
                        setSelected(day);
                        if (window.matchMedia("(max-width: 767px)").matches)
                          document
                            .getElementById("calendar-day-panel")
                            ?.scrollIntoView({
                              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                                .matches
                                ? "instant"
                                : "smooth",
                              block: "start",
                            });
                      }}
                      onKeyDown={(event) => {
                        const offsets: Record<string, number> = {
                          ArrowLeft: -1,
                          ArrowRight: 1,
                          ArrowUp: -7,
                          ArrowDown: 7,
                        };
                        const offset = offsets[event.key];
                        if (offset) {
                          event.preventDefault();
                          const next = days[days.indexOf(day) + offset];
                          if (next) {
                            setSelected(next);
                            document.getElementById(`calendar-date-${next}`)?.focus();
                          }
                        }
                      }}
                      className={cn(
                        "calendar-cell hover:bg-primary/5 flex min-h-[64px] min-w-0 flex-col gap-2 border-r border-b p-2 text-left transition-colors sm:min-h-[100px]",
                        !day.startsWith(month) && "text-muted-foreground",
                        selected === day && "bg-primary/8",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg text-xs",
                          today === day && "bg-primary text-primary-foreground font-semibold",
                        )}
                      >
                        {Number(day.slice(-2))}
                      </span>
                      <div className="hidden space-y-1 sm:block">
                        {matches.slice(0, 2).map((item) => (
                          <span
                            key={`${item.kind}-${item.id}`}
                            className={cn(
                              "block truncate rounded-md px-1.5 py-1 text-[10px]",
                              kindClasses[item.kind],
                            )}
                          >
                            {item.title}
                          </span>
                        ))}
                        {matches.length > 2 && (
                          <span className="text-muted-foreground block text-[10px]">
                            +{matches.length - 2} more
                          </span>
                        )}
                      </div>
                      <span className="text-primary text-[10px] sm:hidden">
                        {matches.length > 0 ? `${matches.length} items` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {!pending && dataMonth === month && dated.map(row)}
              {!pending && dataMonth === month && !dated.length && (
                <p className="text-muted-foreground p-5 text-sm">No dated items match this view.</p>
              )}
            </div>
          )}
        </section>
        <aside id="calendar-day-panel" className="space-y-5">
          <section className="workspace-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {new Date(`${selected}T12:00:00Z`).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h2>
              <Link
                aria-label="Add an item on the selected day"
                href={`/calendar/new?date=${selected}${contextSuffix}`}
                className="text-primary hover:bg-muted rounded-xl p-2"
              >
                <Plus size={18} />
              </Link>
            </div>
            <div className="space-y-3">
              {!pending && dataMonth === month && selectedItems.map(row)}
              {!pending && dataMonth === month && !selectedItems.length && (
                <p className="bg-muted/60 text-muted-foreground rounded-xl p-4 text-sm">
                  No plans for this day. Add a deadline or give your next task a date.
                </p>
              )}
            </div>
          </section>
          <section className="workspace-panel p-5">
            <h2 className="mb-3 text-base font-semibold">Useful next steps</h2>
            {["Draft a statement", "Prepare a transcript", "Follow up on a recommendation"].map(
              (title) => (
                <Link
                  key={title}
                  href={`/calendar/new?kind=task&date=${selected}&title=${encodeURIComponent(title)}${contextSuffix}`}
                  className="hover:bg-muted flex items-center justify-between gap-2 rounded-xl px-2 py-3 text-sm"
                >
                  {title}
                  <Plus size={14} className="text-primary shrink-0" />
                </Link>
              ),
            )}
            <p className="text-muted-foreground mt-3 text-xs">
              Suggestions create a form for you to review. Nothing is added automatically.
            </p>
          </section>
          <section className="workspace-panel p-5">
            <h2 className="mb-4 text-base font-semibold">Undated tasks · {undated.length}</h2>
            <div className="space-y-3">
              {undated.slice((undatedBounds.page - 1) * 5, undatedBounds.page * 5).map(row)}
              {!undated.length && (
                <p className="text-muted-foreground text-sm">
                  Your unscheduled work will appear here.
                </p>
              )}
            </div>
            <PageNavigation page={undatedBounds.page} total={undated.length} pageSize={5} onChange={setUndatedPage} />
          </section>
        </aside>
      </div>
    </div>
  );
}
