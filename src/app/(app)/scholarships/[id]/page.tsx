import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Award, DollarSign, Globe, ExternalLink,
  CheckCircle2, Clock, Plus, Trash2,
} from "lucide-react";
import { getScholarship, getProgramScholarships, getScholarshipApplications } from "@/features/scholarships/actions";
import { getApplications } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createScholarshipApplicationFromForm, createScholarshipDeadlineFromForm, createScholarshipTaskFromForm } from "@/features/scholarships/form-actions";
import { archiveScholarshipFromForm } from "@/features/scholarships/edit-actions";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { SCHOLARSHIP_STATUSES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

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
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Scholarships
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {scholarship.name}
            </h1>
            {scholarship.provider && (
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {scholarship.provider}
              </p>
            )}
          </div>
          <StatusBadge
            status={
              scholarship.eligibility_status === "eligible" ? "done" :
              scholarship.eligibility_status === "likely" ? "preparing" :
              scholarship.eligibility_status === "ineligible" ? "blocked" :
              "exploring"
            }
            label={scholarship.eligibility_status.replace("_", " ")}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Scholarship Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Funding Type</p>
                <p className="text-sm font-medium mt-1 capitalize">{scholarship.funding_type.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</p>
                <p className="text-sm font-medium mt-1">
                  {scholarship.amount
                    ? `${scholarship.currency_code || ""} ${scholarship.amount.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Application Mechanism</p>
                <p className="text-sm font-medium mt-1 capitalize">{scholarship.application_mechanism.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
                <p className="text-sm font-medium mt-1">{scholarship.display_priority}/5</p>
              </div>
            </CardContent>
          </Card>

          {scholarship.coverage_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scholarship.coverage_notes}</p>
              </CardContent>
            </Card>
          )}

          {scholarship.eligibility_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scholarship.eligibility_notes}</p>
              </CardContent>
            </Card>
          )}

          {scholarship.service_obligation_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Service Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scholarship.service_obligation_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Linked Programs */}
          {linkedPrograms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Linked Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {linkedPrograms.map((ps: any) => (
                    <div key={ps.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{ps.programs?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ps.programs?.institutions?.name}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          ps.compatibility_status === "confirmed" ? "done" :
                          ps.compatibility_status === "possible" ? "preparing" :
                          ps.compatibility_status === "ineligible" ? "blocked" :
                          "exploring"
                        }
                        label={ps.compatibility_status.replace("_", " ")}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scholarship Applications */}
          <Card>
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
                        <p className="text-sm font-medium capitalize">{sa.status.replace(/_/g, " ")}</p>
                        {sa.submitted_at && (
                          <p className="text-xs text-muted-foreground">
                            Submitted {new Date(sa.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        status={
                          sa.status === "awarded" ? "done" :
                          sa.status === "submitted" ? "submitted" :
                          sa.status === "rejected" ? "blocked" :
                          "preparing"
                        }
                        label={sa.status.replace(/_/g, " ")}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 mb-4">
                  No scholarship applications yet.
                </p>
              )}

              {/* Create new scholarship application */}
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  New scholarship application
                </p>
                <form action={createScholarshipApplicationFromForm} className="space-y-3">
                  <input type="hidden" name="scholarship_id" value={scholarship.id} />

                  <div className="space-y-1">
                    <label htmlFor="application_id" className="text-sm font-medium">
                      Link to program application (optional)
                    </label>
                    <select
                      id="application_id"
                      name="application_id"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No linked application</option>
                      {applications.map((app: any) => (
                        <option key={app.id} value={app.id}>
                          {app.programs?.name} - {app.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="sa_status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      id="sa_status"
                      name="status"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      {SCHOLARSHIP_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nomination_required"
                      name="nomination_required"
                      className="rounded border-input"
                    />
                    <label htmlFor="nomination_required" className="text-sm">
                      Nomination required
                    </label>
                  </div>

                  <Button type="submit" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add scholarship application
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {deadlines.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.deadline_type}</p>
                      </div>
                      <DeadlineIndicator dueAt={d.due_at} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 mb-4">No deadlines yet.</p>
              )}

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Add deadline</p>
                <form action={createScholarshipDeadlineFromForm} className="space-y-3">
                  <input type="hidden" name="scholarship_id" value={id} />
                  <Input name="title" required placeholder="e.g. Eiffel nomination deadline" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="due_at" type="datetime-local" required />
                    <select name="deadline_type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="funding">Funding</option>
                      <option value="priority">Priority</option>
                      <option value="final">Final</option>
                      <option value="document">Document</option>
                      <option value="decision">Decision</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <Input name="source_url" type="url" placeholder="Source URL (optional)" />
                  <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Add deadline</Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{t.status.replace(/_/g, " ")}</p>
                      </div>
                      <StatusBadge
                        status={
                          t.status === "done" ? "done" :
                          t.status === "blocked" ? "blocked" :
                          t.status === "in_progress" ? "preparing" :
                          "draft"
                        }
                        label={t.status.replace(/_/g, " ")}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 mb-4">No tasks yet.</p>
              )}

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Add task</p>
                <form action={createScholarshipTaskFromForm} className="space-y-3">
                  <input type="hidden" name="scholarship_id" value={id} />
                  <Input name="title" required placeholder="e.g. Gather recommendation letters" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="due_at" type="datetime-local" />
                    <select name="priority" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      {[1,2,3,4,5].map((p) => <option key={p} value={p}>Priority {p}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="blocking" name="blocking" className="rounded border-input" />
                    <label htmlFor="blocking" className="text-sm">Blocking</label>
                  </div>
                  <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Add task</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{scholarship.eligibility_status.replace(/_/g, " ")}</span>
              </div>
              {scholarship.amount && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{scholarship.currency_code} {scholarship.amount.toLocaleString()}</span>
                </div>
              )}
              {scholarship.last_verified_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Verified:</span>
                  <span className="font-medium">{new Date(scholarship.last_verified_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
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
        </div>
      </div>
    </div>
  );
}
