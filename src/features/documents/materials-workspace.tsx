"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpRight, FileText, PenTool, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageNavigation } from "@/components/ui/page-navigation";
import { SearchSelect } from "@/components/ui/search-select";
import { MotionPanel } from "@/components/ui/motion-wrapper";
import { cn } from "@/lib/utils";
import { applicationLabel, type EntryChoices } from "@/features/entries/choices";
import { changeRecommendationStatus, linkRequirementVersion } from "./workspace-actions";
import type { MaterialItem, MaterialWorkspaceData } from "./workspace";

const config = {
  documents: {
    title: "Document library",
    description: "Reusable files, immutable versions, and the requirements they satisfy.",
    primary: "Library",
    secondary: "Requirements",
    kind: "document",
    icon: FileText,
    href: "/documents/new",
    secondaryHref: "/documents/new?mode=requirement",
  },
  essays: {
    title: "Writing studio",
    description: "Your story, shaped for each opportunity. Keep every revision.",
    primary: "Your writing",
    secondary: "",
    kind: "essay",
    icon: PenTool,
    href: "/essays/new",
    secondaryHref: "",
  },
  recommendations: {
    title: "People & recommendations",
    description: "Keep your people and their application-specific letter requests connected.",
    primary: "People",
    secondary: "Requests",
    kind: "recommender",
    icon: Users,
    href: "/recommenders/new",
    secondaryHref: "/recommenders/new?mode=request",
  },
};

export function MaterialsWorkspace({
  kind,
  data,
  choices,
  initialApplication = "",
  initialTab = "primary",
  initialQuery = "",
}: {
  initialQuery?: string;
  initialApplication?: string;
  initialTab?: string;
  kind: keyof typeof config;
  data: MaterialWorkspaceData;
  choices: EntryChoices;
}) {
  const info = config[kind];
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [application, setApplication] = useState(initialApplication);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, startTransition] = useTransition();
  const documentsById = new Map(data.documentChoices.map((item) => [item.id, item]));
  const filtered = data.items;
  function navigate(changes: Record<string, string>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (resetPage) params.delete("page");
    for (const [key, value] of Object.entries(changes)) { if (value) params.set(key, value); else params.delete(key); }
    startTransition(() => router.push(pathname + (params.size ? "?" + params.toString() : "")));
  }
  async function update(item: MaterialItem, value: string) {
    if (!value || item.kind === "requirement" && item.satisfiedBy === value || item.kind === "recommendation" && item.status === value) return;
    setPending(item.id);
    setError("");
    try {
      const result =
        item.kind === "requirement"
          ? await linkRequirementVersion(item.id, value)
          : await changeRecommendationStatus(item.id, value);
      if (result.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("This change couldn’t save. Your existing records are unchanged.");
    } finally {
      setPending("");
    }
  }
  return (
    <div className="workspace-page">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">PREPARATION THAT STAYS CONNECTED</p>
          <h1 className="text-3xl font-semibold tracking-tight">{info.title}</h1>
          <p className="text-muted-foreground mt-3 text-sm">{info.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {info.secondaryHref && (
            <Button asChild variant="outline">
              <Link href={info.secondaryHref}>
                <Plus size={15} />
                {kind === "documents" ? "Requirement" : "Request"}
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={info.href}>
              <Plus size={15} />
              {kind === "documents" ? "Document" : kind === "essays" ? "Writing brief" : "Person"}
            </Link>
          </Button>
        </div>
      </header>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "In this collection", value: data.total },
          {
            label: "Linked on this page",
            value: data.items.filter((item) => item.applicationId).length,
          },
          {
            label: "Ready on this page",
            value: data.items.filter((item) =>
              ["Ready", "Uploaded", "final", "submitted"].includes(item.status),
            ).length,
          },
        ].map((metric) => (
          <div key={metric.label} className="bg-card/70 rounded-2xl p-5">
            <p className="text-2xl font-semibold">{metric.value}</p>
            <p className="text-muted-foreground mt-2 text-xs">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {info.secondary && (
          <div
            role="group"
            aria-label="Workspace collection"
            className="bg-muted flex rounded-2xl p-1"
          >
            {["primary", "secondary"].map((value) => (
              <button
                key={value}
                aria-pressed={tab === value}
                onClick={() => { setTab(value); navigate({ tab: value === "secondary" ? kind === "documents" ? "requirements" : "requests" : "" }); }}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  tab === value && "bg-card text-primary shadow-sm",
                )}
              >
                {value === "primary" ? info.primary : info.secondary}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(event) => { event.preventDefault(); navigate({ q: query }); }} className="bg-card flex min-w-[200px] flex-1 items-center gap-2 rounded-2xl border px-4 py-2"><Search size={16} className="text-muted-foreground" /><input aria-label={`Search ${info.title.toLowerCase()}`} value={query} maxLength={120} onChange={(event) => setQuery(event.target.value)} placeholder="Search your preparation…" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" /><Button type="submit" size="sm" variant="ghost" disabled={navigating}>Search</Button></form>
        <div className="w-full sm:w-[260px]">
          <SearchSelect
            name="materials_application"
            label="Application filter"
            options={[
              { value: "", label: "All contexts" },
              ...choices.applications.map((item) => ({
                value: item.id,
                label: applicationLabel(item, choices),
              })),
            ]}
            value={application}
            onChange={(value) => { setApplication(String(value)); navigate({ application: String(value) }); }}
          />
        </div>
      </div>
      {navigating && <p role="status" className="mb-4 text-sm text-muted-foreground">Loading your view…</p>}
      {error && (
        <p role="alert" className="bg-destructive/10 text-destructive mb-5 rounded-2xl p-4 text-sm">
          {error}
        </p>
      )}
      {data.truncated && (
        <p role="status" className="text-muted-foreground mb-4 text-sm">
          The file picker has reached its library limit. Open a document to inspect earlier versions.
        </p>
      )}
      <p role="status" className="sr-only">
        {filtered.length} records shown
      </p>
      {filtered.length ? (
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => {
            const parent = choices.applications.find(
              (current) => current.id === item.applicationId,
            );
            const matchingVersions =
              item.kind === "requirement"
                ? data.versions.filter((version) => {
                    const document = documentsById.get(version.document_id);
                    return (
                      version.id === item.satisfiedBy || document &&
                      (!item.documentType ||
                        item.documentType === "other" ||
                        document.documentType === item.documentType)
                    );
                  })
                : [];
            return (
              <MotionPanel
                key={`${item.kind}-${item.id}`}
                delay={Math.min(index * 0.03, 0.15)}
                className="workspace-panel p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="bg-primary/10 text-primary rounded-2xl p-3">
                    <info.icon size={19} />
                  </div>
                  <span className="bg-muted rounded-lg px-2 py-1 text-xs capitalize">
                    {item.status}
                  </span>
                </div>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{item.subtitle}</p>
                <p className="text-muted-foreground mt-3 border-t pt-3 text-xs leading-relaxed">
                  {parent
                    ? applicationLabel(parent, choices)
                    : item.applicationId
                      ? "Linked application"
                      : item.kind === "document" || item.kind === "essay"
                        ? "Reusable · not tied to a program application"
                        : item.kind === "recommender"
                          ? "Person · reusable across requests"
                          : "Scholarship or general context"}
                </p>
                {item.kind === "requirement" && (
                  <div className="mt-4">
                    <SearchSelect
                      name={`version-${item.id}`}
                      label="Attach a file version"
                      options={[
                        { value: "", label: "Choose an uploaded version" },
                        ...matchingVersions.map((version) => ({
                          value: version.id,
                          label: `${version.file_name} · v${version.version_number}`,
                        })),
                      ]}
                      value={item.satisfiedBy || ""}
                      disabled={!!pending || navigating}
                      onChange={(value) => update(item, String(value))}
                    />
                    <p className="text-muted-foreground mt-2 text-xs">
                      {matchingVersions.length
                        ? "Choose a matching type. Existing versions are preserved."
                        : "Upload a matching document in the library first."}
                    </p>
                  </div>
                )}
                {item.kind === "recommendation" && (
                  <div className="mt-4">
                    <SearchSelect
                      name={`status-${item.id}`}
                      label="Request stage"
                      options={["pending", "sent", "accepted", "submitted", "declined"].map(
                        (status) => ({ value: status, label: status }),
                      )}
                      value={item.status}
                      disabled={!!pending}
                      onChange={(value) => update(item, String(value))}
                    />
                    <p className="text-muted-foreground mt-2 text-xs">
                      Changing the stage tracks progress; it does not send a message.
                    </p>
                  </div>
                )}
                {item.href && (
                  <Link
                    href={item.href}
                    className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-medium"
                  >
                    {item.kind === "essay"
                      ? "Open writing studio"
                      : item.kind === "document"
                        ? "Files & versions"
                        : "Open workspace"}
                    <ArrowUpRight size={15} />
                  </Link>
                )}
                {["document", "essay", "recommendation"].includes(item.kind) && (
                  <Link
                    href={`/calendar/new?kind=task&${item.kind === "document" ? "document" : item.kind === "essay" ? "essay" : "request"}=${item.id}`}
                    className="text-primary mt-3 block text-xs font-medium"
                  >
                    Plan a related task →
                  </Link>
                )}
                {item.kind === "recommender" && (
                  <Link
                    href={`/recommenders/new?mode=request&recommender=${item.id}${application ? `&application=${application}` : ""}`}
                    className="text-primary mt-3 block text-xs font-medium"
                  >
                    Track a request for this person →
                  </Link>
                )}
              </MotionPanel>
            );
          })}
        </div>
      ) : (
        <div className="workspace-panel p-10 text-center">
          <info.icon className="text-primary mx-auto mb-5" size={32} />
          <h2 className="text-xl font-semibold">
            {query || application ? "No records match this view." : "Give your preparation a home."}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
            {query || application
              ? "Try another search or clear the application filter."
              : tab === "secondary"
                ? "Create a requirement or request and choose the application it supports."
                : "Start with a reusable record, then connect it to the opportunities you pursue."}
          </p>
          {query || application ? (
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => {
                setQuery("");
                setApplication("");
                navigate({ q: "", application: "" });
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button className="mt-5" asChild>
              <Link href={tab === "secondary" ? info.secondaryHref : info.href}>
                Create your first entry
              </Link>
            </Button>
          )}
        </div>
      )}
      <PageNavigation page={data.page} total={data.total} pageSize={data.pageSize} pending={navigating} onChange={(page) => navigate({ page: String(page) }, false)} />
    </div>
  );
}
