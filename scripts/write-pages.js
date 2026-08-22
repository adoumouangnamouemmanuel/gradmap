const fs = require("fs");

// ============================================================
// Programs list page
// ============================================================
const programsListPage = `import Link from "next/link";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getPrograms } from "@/features/programs/actions";

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Programs"
        description="Track graduate programs across institutions."
        action={
          <Button asChild>
            <Link href="/programs/new">
              <Plus className="mr-1 h-4 w-4" />
              Add program
            </Link>
          </Button>
        }
      />

      {programs.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No programs yet"
          description="Start by adding an institution, then create programs to track."
          action={{ label: "Add first program", href: "/programs/new" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Program</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Deadline</span>
                </div>
                {programs.map((program: any) => (
                  <Link
                    key={program.id}
                    href={\`/programs/\${program.id}\`}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{program.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {program.institutions?.name}
                        {program.institutions?.country_name && (
                          <span className="flex items-center gap-0.5">
                            <span>·</span>
                            <Globe className="h-3 w-3" />
                            {program.institutions.country_name}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} />
                    <span className="text-sm font-medium">{program.display_priority}/5</span>
                    <span className="text-xs text-muted-foreground">{program.intake_year}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {programs.map((program: any) => (
              <Link key={program.id} href={\`/programs/\${program.id}\`}>
                <MobileListItem
                  title={program.name}
                  subtitle={\`\${program.institutions?.name} · \${program.institutions?.country_name || ""}\`}
                  badge={
                    <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} />
                  }
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/programs/page.tsx", programsListPage);
console.log("programs/page.tsx written");

// ============================================================
// Program detail page
// ============================================================
const programDetailPage = `import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, ExternalLink, Clock } from "lucide-react";
import { getProgram, getProgramEvaluation } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Metric } from "@/components/domain/metric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let program;
  try {
    program = await getProgram(id);
  } catch {
    notFound();
  }

  let evaluation = null;
  try {
    evaluation = await getProgramEvaluation(id);
  } catch {
    // No evaluation yet
  }

  // Compute normalized score if evaluation exists
  let normalizedScore: number | null = null;
  if (evaluation) {
    const scores = [
      { value: evaluation.academic_fit, weight: evaluation.academic_weight },
      { value: evaluation.research_career_fit, weight: evaluation.research_weight },
      { value: evaluation.funding_strength, weight: evaluation.funding_weight },
      { value: evaluation.admission_feasibility, weight: evaluation.feasibility_weight },
      { value: evaluation.location_personal_fit, weight: evaluation.location_weight },
    ];
    const totalWeight = scores.reduce((sum, s) => sum + (s.weight || 0), 0);
    const scored = scores.filter((s) => s.value != null);
    if (scored.length === scores.length && totalWeight > 0) {
      normalizedScore = scored.reduce((sum, s) => sum + (s.value! / 5) * s.weight!, 0);
      normalizedScore = Math.round(normalizedScore * 10) / 10;
    }
  }

  const inst = program.institutions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/programs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Programs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {program.name}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {inst?.name}
              {inst?.country_name && (
                <>
                  <span>·</span>
                  <Globe className="h-4 w-4" />
                  {inst.country_name}
                </>
              )}
              {inst?.city && <span>({inst.city})</span>}
            </p>
          </div>
          <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} label={program.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Program Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Degree Type</p>
                <p className="text-sm font-medium mt-1">{program.degree_type || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Field</p>
                <p className="text-sm font-medium mt-1">{program.field || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intake</p>
                <p className="text-sm font-medium mt-1">{program.intake_term || "—"} {program.intake_year}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</p>
                <p className="text-sm font-medium mt-1">{program.duration_months ? \`\${program.duration_months} months\` : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Mode</p>
                <p className="text-sm font-medium mt-1">{program.delivery_mode || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
                <p className="text-sm font-medium mt-1">{program.display_priority}/5</p>
              </div>
            </CardContent>
          </Card>

          {program.program_url && (
            <Card>
              <CardContent className="p-4">
                <a
                  href={program.program_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View official program page
                </a>
              </CardContent>
            </Card>
          )}

          {program.research_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Research Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{program.research_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evaluation score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              {normalizedScore !== null ? (
                <div className="text-center">
                  <p className="font-serif text-4xl font-bold text-primary">{normalizedScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evaluation yet
                </p>
              )}
              <Separator className="my-4" />
              <div className="space-y-2">
                {[
                  { label: "Academic Fit", value: evaluation?.academic_fit },
                  { label: "Research/Career", value: evaluation?.research_career_fit },
                  { label: "Funding Strength", value: evaluation?.funding_strength },
                  { label: "Admission Feasibility", value: evaluation?.admission_feasibility },
                  { label: "Location/Personal", value: evaluation?.location_personal_fit },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value != null ? \`\${item.value}/5\` : "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={\`/applications?program=\${program.id}\`}>View application</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={\`/programs/\${program.id}/edit\`}>Edit program</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/programs/[id]/page.tsx", programDetailPage);
console.log("programs/[id]/page.tsx written");

// ============================================================
// Applications list page
// ============================================================
const applicationsListPage = `import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Separator } from "@/components/ui/separator";
import { getApplications } from "@/features/programs/actions";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Applications"
        description="Track your program applications and their status."
        action={
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="mr-1 h-4 w-4" />
              New application
            </Link>
          </Button>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No applications yet"
          description="Create an application from a program page to start tracking."
          action={{ label: "Browse programs", href: "/programs" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Program</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Round</span>
                </div>
                {applications.map((app: any) => (
                  <Link
                    key={app.id}
                    href={\`/applications/\${app.id}\`}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{app.programs?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.programs?.institutions?.name} · {app.programs?.institutions?.country_name}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        app.status === "submitted" ? "submitted" :
                        app.status === "admitted" ? "done" :
                        app.status === "rejected" ? "blocked" :
                        app.status === "preparing" || app.status === "ready" ? "preparing" :
                        "exploring"
                      }
                      label={app.status}
                    />
                    <span className="text-sm font-medium">{app.priority}/5</span>
                    <span className="text-xs text-muted-foreground">{app.application_round || "—"}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {applications.map((app: any) => (
              <Link key={app.id} href={\`/applications/\${app.id}\`}>
                <MobileListItem
                  title={app.programs?.name || "Application"}
                  subtitle={\`\${app.programs?.institutions?.name} · \${app.programs?.institutions?.country_name || ""}\`}
                  badge={
                    <StatusBadge
                      status={
                        app.status === "submitted" ? "submitted" :
                        app.status === "admitted" ? "done" :
                        app.status === "rejected" ? "blocked" :
                        app.status === "preparing" || app.status === "ready" ? "preparing" :
                        "exploring"
                      }
                      label={app.status}
                    />
                  }
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/applications/page.tsx", applicationsListPage);
console.log("applications/page.tsx written");

// ============================================================
// Application detail page
// ============================================================
const applicationDetailPage = `import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, Clock } from "lucide-react";
import { getApplication } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let application;
  try {
    application = await getApplication(id);
  } catch {
    notFound();
  }

  const program = application.programs;
  const inst = program?.institutions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Applications
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {program?.name}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {inst?.name}
              {inst?.country_name && (
                <>
                  <span>·</span>
                  <Globe className="h-4 w-4" />
                  {inst.country_name}
                </>
              )}
            </p>
          </div>
          <StatusBadge
            status={
              application.status === "submitted" ? "submitted" :
              application.status === "admitted" ? "done" :
              application.status === "rejected" ? "blocked" :
              application.status === "preparing" || application.status === "ready" ? "preparing" :
              "exploring"
            }
            label={application.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="text-sm font-medium mt-1 capitalize">{application.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
                <p className="text-sm font-medium mt-1">{application.priority}/5</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Round</p>
                <p className="text-sm font-medium mt-1">{application.application_round || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee Status</p>
                <p className="text-sm font-medium mt-1 capitalize">{application.fee_status}</p>
              </div>
              {application.submitted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-medium mt-1">{new Date(application.submitted_at).toLocaleDateString()}</p>
                </div>
              )}
              {application.response_due_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response Due</p>
                  <DeadlineIndicator dueAt={application.response_due_at} />
                </div>
              )}
            </CardContent>
          </Card>

          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={\`/programs/\${application.program_id}\`}>View program</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={\`/calendar?application=\${application.id}\`}>View deadlines</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/applications/[id]/page.tsx", applicationDetailPage);
console.log("applications/[id]/page.tsx written");

// ============================================================
// Calendar page (deadlines + tasks)
// ============================================================
const calendarPage = `import { CalendarDays, Plus, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Separator } from "@/components/ui/separator";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";

export default async function CalendarPage() {
  const [deadlines, tasks] = await Promise.all([
    getUpcomingDeadlines(30),
    getTasks(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Calendar"
        description="Upcoming deadlines and tasks."
        action={
          <Button asChild>
            <a href="/calendar/new">
              <Plus className="mr-1 h-4 w-4" />
              Add deadline
            </a>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-1">
                {deadlines.map((d: any) => (
                  <div key={d.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.deadline_type}</p>
                      </div>
                      <DeadlineIndicator dueAt={d.due_at} />
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Pending tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.filter((t: any) => t.status !== "done" && t.status !== "cancelled").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            ) : (
              <div className="space-y-1">
                {tasks
                  .filter((t: any) => t.status !== "done" && t.status !== "cancelled")
                  .slice(0, 10)
                  .map((task: any) => (
                    <div key={task.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge
                              status={
                                task.status === "in_progress" ? "preparing" :
                                task.status === "blocked" ? "blocked" :
                                "draft"
                              }
                              label={task.status.replace("_", " ")}
                            />
                            {task.blocking && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Blocking</span>
                            )}
                          </div>
                        </div>
                        {task.due_at && (
                          <DeadlineIndicator dueAt={task.due_at} />
                        )}
                      </div>
                      <Separator />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/calendar/page.tsx", calendarPage);
console.log("calendar/page.tsx written");

// ============================================================
// Documents page (placeholder for Phase 5)
// ============================================================
const documentsPage = `import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Your private document vault."
      />
      <EmptyState
        icon={<FolderOpen className="h-6 w-6" />}
        title="Document vault coming soon"
        description="Secure document upload and version management will be available in a future update."
      />
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/documents/page.tsx", documentsPage);
console.log("documents/page.tsx written");

// ============================================================
// Scholarships page (placeholder for Phase 4)
// ============================================================
const scholarshipsPage = `import { Award } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";

export default function ScholarshipsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Scholarships"
        description="Track funding opportunities and scholarship applications."
      />
      <EmptyState
        icon={<Award className="h-6 w-6" />}
        title="Scholarship tracking coming soon"
        description="Scholarship management will be available in a future update."
      />
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/scholarships/page.tsx", scholarshipsPage);
console.log("scholarships/page.tsx written");

// ============================================================
// More page (placeholder)
// ============================================================
const morePage = `import Link from "next/link";
import { BookOpen, Award, FileText, Users, Settings, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";

const moreItems = [
  { href: "/essays", label: "Essays", icon: FileText, description: "Coming in Phase 6" },
  { href: "/recommenders", label: "Recommenders", icon: Users, description: "Coming in Phase 6" },
  { href: "/contacts", label: "Contacts", icon: Users, description: "Coming in Phase 6" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Account and preferences" },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="More" description="Additional sections and settings." />
      <div className="mt-6 space-y-2">
        {moreItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/more/page.tsx", morePage);
console.log("more/page.tsx written");

// ============================================================
// Settings page (placeholder)
// ============================================================
const settingsPage = `import { Settings } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={logout}>
              <Button type="submit" variant="destructive">Sign out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/settings/page.tsx", settingsPage);
console.log("settings/page.tsx written");

console.log("\\nAll Phase 3 pages written successfully!");
