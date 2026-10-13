import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  DollarSign,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getScholarship,
  getProgramScholarships,
  getScholarshipApplications,
  updateScholarshipEligibilityFromForm,
  updateScholarshipApplicationStatusFromForm,
} from "@/features/scholarships/actions";
import { getApplications } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { archiveScholarshipFromForm } from "@/features/scholarships/edit-actions";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { StatusSelect } from "@/components/domain/status-select";
import {
  SCHOLARSHIP_STATUSES,
  SCHOLARSHIP_STATUS_LABELS,
  ELIGIBILITY_STATUSES,
  ELIGIBILITY_STATUS_LABELS,
} from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let scholarship;
  try {
    scholarship = await getScholarship(id);
  } catch {
    notFound();
  }

  let linkedPrograms: any[] = [];
  let scholarshipApps: any[] = [];
  let applications: any[] = [];
  try {
    linkedPrograms = await getProgramScholarships(id);
  } catch {
    // No linked programs
  }

  try {
    scholarshipApps = await getScholarshipApplications();
    scholarshipApps = scholarshipApps.filter((sa: any) => sa.scholarship_id === id);
  } catch {
    // No scholarship applications
  }

  try {
    applications = await getApplications();
  } catch {
    // No applications
  }

  let deadlines: any[] = [];
  let tasks: any[] = [];
  try {
    const allDeadlines = await getUpcomingDeadlines(365);
    deadlines = allDeadlines.filter((d: any) => d.scholarship_id === id);
  } catch {
    // No deadlines
  }
  try {
    const allTasks = await getTasks();
    tasks = allTasks.filter((t: any) => t.scholarship_id === id);
  } catch {
    // No tasks
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/scholarships"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Scholarships
      </Link>

      {/* Header */}
      <FadeIn delay={0.1}>
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                {scholarship.name}
              </h1>
              {scholarship.provider && (
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {scholarship.provider}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge
                status={
                  scholarship.eligibility_status === "eligible"
                    ? "done"
                    : scholarship.eligibility_status === "likely"
                      ? "preparing"
                      : scholarship.eligibility_status === "ineligible"
                        ? "blocked"
                        : "exploring"
                }
                label={
                  ELIGIBILITY_STATUS_LABELS[scholarship.eligibility_status] ||
                  scholarship.eligibility_status
                }
              />
              <form action={updateScholarshipEligibilityFromForm.bind(null, id)}>
                <label htmlFor="scholarship-status" className="sr-only">
                  Update scholarship status
                </label>
                <StatusSelect
                  defaultValue={scholarship.eligibility_status}
                  options={ELIGIBILITY_STATUSES.map((status) => ({
                    value: status,
                    label: ELIGIBILITY_STATUS_LABELS[status],
                  }))}
                />
              </form>
            </div>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer delay={0.2} className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Scholarship Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Funding Type
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize">
                    {scholarship.funding_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Amount
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {scholarship.amount
                      ? `${scholarship.currency_code || ""} ${scholarship.amount.toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Application Mechanism
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize">
                    {scholarship.application_mechanism.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Priority
                  </p>
                  <p className="mt-1 text-sm font-medium">{scholarship.display_priority}/5</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {scholarship.coverage_notes && (
            <StaggerItem>
              <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {scholarship.coverage_notes}
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {scholarship.eligibility_notes && (
            <StaggerItem>
              <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {scholarship.eligibility_notes}
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {scholarship.service_obligation_notes && (
            <StaggerItem>
              <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Service Obligations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {scholarship.service_obligation_notes}
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {/* Linked Programs */}
          {linkedPrograms.length > 0 && (
            <StaggerItem>
              <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Linked Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {linkedPrograms.map((ps: any) => (
                      <div key={ps.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{ps.programs?.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {ps.programs?.institutions?.name}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            ps.compatibility_status === "confirmed"
                              ? "done"
                              : ps.compatibility_status === "possible"
                                ? "preparing"
                                : ps.compatibility_status === "ineligible"
                                  ? "blocked"
                                  : "exploring"
                          }
                          label={ps.compatibility_status.replace("_", " ")}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {/* Scholarship Applications */}
          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg">Scholarship Applications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {scholarshipApps.length > 0 ? (
                  <div className="space-y-2">
                    {scholarshipApps.map((sa: any) => (
                      <div key={sa.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {sa.status.replace(/_/g, " ")}
                          </p>
                          {sa.submitted_at && (
                            <p className="text-muted-foreground text-xs">
                              Submitted {new Date(sa.submitted_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <StatusBadge
                          status={
                            sa.status === "awarded"
                              ? "done"
                              : sa.status === "submitted"
                                ? "submitted"
                                : sa.status === "rejected"
                                  ? "blocked"
                                  : "preparing"
                          }
                          label={sa.status.replace(/_/g, " ")}
                        />
                        <form action={updateScholarshipApplicationStatusFromForm.bind(null, sa.id)}>
                          <label
                            htmlFor={`scholarship-application-status-${sa.id}`}
                            className="sr-only"
                          >
                            Update scholarship application status
                          </label>
                          <StatusSelect
                            id={`scholarship-application-status-${sa.id}`}
                            defaultValue={sa.status}
                            options={SCHOLARSHIP_STATUSES.map((status) => ({
                              value: status,
                              label: SCHOLARSHIP_STATUS_LABELS[status],
                            }))}
                          />
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 py-4 text-center text-sm">
                    No scholarship applications yet.
                  </p>
                )}

                {/* Create new scholarship application */}
                <div className="mt-4 border-t pt-4">
                  <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                    New scholarship application
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/scholarships/new?mode=application&scholarship=${id}`}>
                      <Plus size={15} />
                      Start a scholarship application
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Deadlines */}
          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                {deadlines.length > 0 ? (
                  <div className="mb-4 space-y-2">
                    {deadlines.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between border-b py-2 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.title}</p>
                          <p className="text-muted-foreground text-xs capitalize">
                            {d.deadline_type}
                          </p>
                        </div>
                        <DeadlineIndicator dueAt={d.due_at} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 py-4 text-center text-sm">
                    No deadlines yet.
                  </p>
                )}

                <div className="border-t pt-4">
                  <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                    Add deadline
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/calendar/new?scholarship=${id}`}>
                      <Plus size={15} />
                      Add deadline
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Tasks */}
          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="mb-4 space-y-2">
                    {tasks.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between border-b py-2 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{t.title}</p>
                          <p className="text-muted-foreground text-xs capitalize">
                            {t.status.replace(/_/g, " ")}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            t.status === "done"
                              ? "done"
                              : t.status === "blocked"
                                ? "blocked"
                                : t.status === "in_progress"
                                  ? "preparing"
                                  : "draft"
                          }
                          label={t.status.replace(/_/g, " ")}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 py-4 text-center text-sm">
                    No tasks yet.
                  </p>
                )}

                <div className="border-t pt-4">
                  <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                    Add task
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/calendar/new?kind=task&scholarship=${id}`}>
                      <Plus size={15} />
                      Plan a task
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {scholarship.eligibility_status.replace(/_/g, " ")}
                  </span>
                </div>
                {scholarship.amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {scholarship.currency_code} {scholarship.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {scholarship.last_verified_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Verified:</span>
                    <span className="font-medium">
                      {new Date(scholarship.last_verified_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-border/50 bg-background/50 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {scholarship.official_url && (
                  <Button asChild className="w-full" variant="outline">
                    <Link href={scholarship.official_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View official page
                    </Link>
                  </Button>
                )}
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/scholarships/${scholarship.id}/edit`}>Edit scholarship</Link>
                </Button>
                <form action={archiveScholarshipFromForm}>
                  <input type="hidden" name="id" value={scholarship.id} />
                  <Button type="submit" className="w-full" variant="ghost" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Archive scholarship
                  </Button>
                </form>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  );
}
