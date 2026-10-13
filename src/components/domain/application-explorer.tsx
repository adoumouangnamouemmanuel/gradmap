"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageNavigation } from "@/components/ui/page-navigation";
import { ArrowUpRight, Building2, LayoutGrid, List, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  filterApplications,
  groupApplications,
  type ApplicationSummary,
  type ApplicationPage,
} from "@/features/programs/workspace";

export function ApplicationExplorer({ applications, pagination, initialQuery = "", initialStatus = "all", initialView = "list" }: { applications: ApplicationSummary[]; pagination?: Omit<ApplicationPage, "items">; initialQuery?: string; initialStatus?: string; initialView?: "list" | "board" }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [view, setView] = useState<"list" | "board">(initialView);
  const filtered = pagination ? applications : filterApplications(applications, query, status);
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  function navigate(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString()); params.set("view", view);
    for (const [key, value] of Object.entries(changes)) { if (value) params.set(key, value); else params.delete(key); }
    startTransition(() => router.push(pathname + "?" + params.toString()));
  }
  const hasApplications = pagination ? pagination.stages.length > 0 : applications.length > 0;

  function applicationCard(application: ApplicationSummary) {
    return (
      <Link
        key={application.id}
        href={`/applications/${application.id}`}
        className="application-row group"
      >
        <div className="bg-primary/7 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <Building2 size={20} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {application.programs?.institutions?.name || "Institution pending"}
          </p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {application.programs?.name || "Untitled application"}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {application.programs?.institutions?.country_name || "Location pending"} · Priority{" "}
            {application.priority}/5
          </p>
        </div>
        <span
          className={cn(
            "stage-label",
            ["admitted", "enrolled"].includes(application.status) &&
              "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          )}
        >
          {APPLICATION_STATUS_LABELS[application.status] || application.status.replaceAll("_", " ")}
        </span>
        <ArrowUpRight
          size={17}
          className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form onSubmit={(event) => { event.preventDefault(); if (pagination) navigate({ q: query, page: "" }); }} className="bg-card flex w-full min-w-0 flex-none items-center gap-2 rounded-2xl border px-3 py-3 sm:w-auto sm:flex-1">
          <Search size={16} className="text-muted-foreground" />
          <input
            aria-label="Search applications"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find your next chapter…"
            maxLength={120}
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
          {pagination && <Button type="submit" size="sm" variant="ghost" disabled={pending}>Search</Button>}
        </form>
        <select
          aria-label="Filter applications by status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); if (pagination) navigate({ status: event.target.value === "all" ? "" : event.target.value, page: "" }); }}
          className="bg-card h-11 max-w-full rounded-xl border px-3 text-sm"
        >
          <option value="all">All stages</option>
          {(pagination?.stages || Array.from(new Set(applications.map((application) => application.status)))).map(
            (value) => (
              <option key={value} value={value}>
                {APPLICATION_STATUS_LABELS[value] || value}
              </option>
            ),
          )}
        </select>
        <div
          className="bg-card flex rounded-xl border p-1"
          role="group"
          aria-label="Application view"
        >
          {(["list", "board"] as const).map((value) => (
            <motion.button
              key={value}
              type="button"
              aria-label={`${value} view`}
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                view === value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
              whileTap={{ scale: 0.92 }}
            >
              {value === "list" ? <List size={17} /> : <LayoutGrid size={17} />}
            </motion.button>
          ))}
        </div>
      </div>
      {pending && <p role="status" className="mb-4 text-sm text-muted-foreground">Loading applications…</p>}
      {pagination && view === "board" && pagination.total > pagination.pageSize && <p className="mb-4 text-xs text-muted-foreground">The board groups the applications on this page.</p>}
      <p className="sr-only" role="status">
        {filtered.length} applications found
      </p>
      {filtered.length === 0 ? (
        <div className="workspace-panel application-empty p-8 text-center">
          <Building2 className="empty-illustration text-primary mx-auto mb-5" size={28} />
          <h3 className="text-xl font-semibold tracking-tight">
            {hasApplications
              ? "No matching applications"
              : "Every journey starts with one possibility."}
          </h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
            {applications.length
              ? "Try another search or stage."
              : "Add your first application and give your next chapter a place to grow."}
          </p>
          {hasApplications ? (
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setStatus("all");
                if (pagination) navigate({ q: "", status: "", page: "" });
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button asChild className="mt-5">
              <Link href="/applications/new">
                <Plus size={16} /> Add application
              </Link>
            </Button>
          )}
        </div>
      ) : view === "list" ? (
        <div className="bg-card overflow-hidden rounded-2xl border">
          {filtered.map(applicationCard)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {groupApplications(filtered).map((stage) => {
            const items = stage.applications;
            return (
              <section key={stage.label} className="bg-muted/60 rounded-2xl p-3">
                <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-medium">
                  {stage.label}
                  <span className="text-muted-foreground">{items.length}</span>
                </h3>
                <div className="board-column space-y-3">
                  {items.map(applicationCard)}
                  {!items.length && (
                    <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-center text-xs">
                      Nothing here yet
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {pagination && <PageNavigation page={pagination.page} total={pagination.total} pageSize={pagination.pageSize} pending={pending} onChange={(page) => navigate({ page: String(page) })} />}
    </div>
  );
}
