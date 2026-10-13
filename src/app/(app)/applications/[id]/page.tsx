import Link from "next/link";
import type { Tables } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { EntryRetry } from "@/features/entries/retry";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, Globe, Clock, DollarSign, Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { getApplication } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExpenseFromForm } from "@/features/scholarships/form-actions";
import { updateExpenseFromForm, archiveExpenseFromForm } from "@/features/scholarships/edit-actions";
import { archiveApplication, deleteDeadline, deleteTask } from "@/features/programs/actions";
import {
  CURRENCIES,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  DEADLINE_TYPE_LABELS,
} from "@/lib/constants";

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

  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const results = await Promise.all([
    client.from("expenses").select("*").eq("user_id", user.id).eq("application_id", id).order("created_at").limit(501),
    client.from("deadlines").select("*").eq("user_id", user.id).eq("application_id", id).is("archived_at", null).order("due_at").limit(501),
    client.from("document_requirements").select("*,document_versions!document_requirements_satisfied_by_version_id_fkey(document_id)").eq("user_id", user.id).eq("application_id", id).order("created_at").limit(501),
    client.from("essay_prompts").select("*").eq("user_id", user.id).eq("application_id", id).is("archived_at", null).order("created_at").limit(501),
    client.from("recommendation_requests").select("*,recommenders!recommendation_requests_recommender_owner_fkey(name)").eq("user_id", user.id).eq("application_id", id).order("created_at").limit(501),
  ]);
  if (results.some((result) => result.error)) return <EntryRetry href="/applications" />;
  const expenses: Tables<"expenses">[] = results[0].data || [];
  const deadlines: Tables<"deadlines">[] = results[1].data || [];
  const documents: Tables<"document_requirements">[] = results[2].data || [];
  const essayPrompts: Tables<"essay_prompts">[] = results[3].data || [];
  const recRequests: (Tables<"recommendation_requests"> & { recommenders?: { name: string } | null })[] = results[4].data || [];
  const taskContexts = [`application_id.eq.${application.id}`];
  if (essayPrompts.length) taskContexts.push(`essay_prompt_id.in.(${essayPrompts.map((item) => item.id).join(",")})`);
  if (recRequests.length) taskContexts.push(`recommendation_request_id.in.(${recRequests.map((item) => item.id).join(",")})`);
  const taskResult = await client.from("tasks").select("*").eq("user_id", user.id).is("archived_at", null).or(taskContexts.join(",")).order("due_at").limit(501);
  if (taskResult.error) return <EntryRetry href="/applications" />;
  const tasks: Tables<"tasks">[] = taskResult.data || [];
  const truncated = results.some((result) => (result.data?.length || 0) > 500) || tasks.length > 500;

  const program = application.programs;
  const inst = program?.institutions;

  const totalExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum: number, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="workspace-page">
      <Link
        href="/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Applications
      </Link>

      <div className="mb-8 rounded-3xl border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
              {program?.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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

      {truncated && <p role="status" className="mb-5 text-sm text-muted-foreground">Some older entries exceed this workspace’s limit. Their detail pages remain available.</p>}
      <nav aria-label="Application sections" className="workspace-section-nav">
        <a href="#overview">Overview</a>
        <a href="#deadlines">Deadlines · {deadlines.length}</a>
        <a href="#tasks">Tasks · {tasks.filter((task) => task.status !== "done" && task.status !== "cancelled").length} open</a>
        {essayPrompts.length > 0 && <a href="#writing">Writing · {essayPrompts.length}</a>}
        {recRequests.length > 0 && <a href="#people">Recommendations · {recRequests.length}</a>}
        <a href="#documents">Documents · {documents.length}</a>
      </nav>
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-primary/5 p-5" aria-label="Task progress">
        <div><p className="text-sm font-semibold">Your preparation, at a glance</p><p className="mt-1 text-sm text-muted-foreground">{tasks.filter((task) => task.status === "done").length} of {tasks.filter((task) => task.status !== "cancelled").length} tracked tasks complete. {tasks.length ? "Every finished task is a step forward." : "Add tasks below to build your plan."}</p></div>
        <a href="#tasks" className="text-sm font-medium text-primary hover:underline">Continue preparation →</a>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card id="overview">
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
                <p className="text-sm font-medium mt-1">{application.application_round || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee Status</p>
                <p className="text-sm font-medium mt-1 capitalize">{application.fee_status}</p>
              </div>
              {application.fee_amount && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Application Fee</p>
                  <p className="text-sm font-medium mt-1">{application.fee_currency_code} {application.fee_amount}</p>
                </div>
              )}
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
              {application.decision_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Decision Date</p>
                  <p className="text-sm font-medium mt-1">{new Date(application.decision_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decision / Offer Card */}
          {(application.decision_type || application.offer_amount || application.enrollment_deadline) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <Trophy className="h-4 w-4 text-primary" />
                  Decision & Offer
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {application.decision_type && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Decision</p>
                    <p className="text-sm font-medium mt-1 capitalize">{application.decision_type}</p>
                  </div>
                )}
                {application.offer_amount && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offer Amount</p>
                    <p className="text-sm font-medium mt-1">{application.offer_currency_code} {application.offer_amount.toLocaleString()}</p>
                  </div>
                )}
                {application.offer_financial_aid && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Financial Aid</p>
                    <p className="text-sm font-medium mt-1">Yes</p>
                  </div>
                )}
                {application.offer_aid_details && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aid Details</p>
                    <p className="text-sm font-medium mt-1">{application.offer_aid_details}</p>
                  </div>
                )}
                {application.enrollment_deadline && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enrollment Deadline</p>
                    <DeadlineIndicator dueAt={application.enrollment_deadline} />
                  </div>
                )}
                {application.decision_conditions && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conditions</p>
                    <p className="text-sm font-medium mt-1">{application.decision_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Deadlines */}
          <Card id="deadlines">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Deadlines ({deadlines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length > 0 && (
                <div className="space-y-2 mb-4">
                  {deadlines.map((d) => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{DEADLINE_TYPE_LABELS[d.deadline_type] || d.deadline_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeadlineIndicator dueAt={d.due_at} />
                        <form action={async () => {
                          "use server";
                          await deleteDeadline(d.id);
                        }}>
                          <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 px-2 text-xs">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" asChild><Link href={`/calendar/new?application=${id}`}><Plus className="h-4 w-4" />Add deadline</Link></Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card id="tasks">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                Tasks ({tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{TASK_STATUS_LABELS[t.status] || t.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={
                            t.status === "done" ? "done" :
                            t.status === "in_progress" ? "preparing" :
                            t.status === "cancelled" ? "blocked" :
                            "draft"
                          }
                          label={TASK_STATUS_LABELS[t.status] || t.status}
                        />
                        <form action={async () => {
                          "use server";
                          await deleteTask(t.id);
                        }}>
                          <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 px-2 text-xs">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" asChild><Link href={`/calendar/new?kind=task&application=${id}`}><Plus className="h-4 w-4" />Plan a task</Link></Button>
            </CardContent>
          </Card>

          {/* Related Essay Prompts */}
          {essayPrompts.length > 0 && (
            <Card id="writing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  Essay Prompts ({essayPrompts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {essayPrompts.map((e) => (
                    <Link
                      key={e.id}
                      href={`/essays/${e.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{e.status?.replace(/_/g, " ")}</p>
                      </div>
                      <StatusBadge
                        status={
                          e.status === "final" || e.status === "submitted" ? "done" :
                          "draft"
                        }
                        label={e.status?.replace(/_/g, " ") || "draft"}
                      />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Recommendation Requests */}
          {recRequests.length > 0 && (
            <Card id="people">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  Recommendation Requests ({recRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{r.recommenders?.name || "Request"}</p>
                        <p className="text-xs text-muted-foreground">{r.notes || "No notes"}</p>
                      </div>
                      <StatusBadge
                        status={
                          r.status === "submitted" ? "done" :
                          r.status === "accepted" ? "preparing" :
                          r.status === "declined" ? "blocked" :
                          "draft"
                        }
                        label={r.status || "pending"}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card id="documents"><CardHeader><CardTitle>Document requirements · {documents.length}</CardTitle></CardHeader><CardContent><div className="space-y-3">{documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3"><p className="text-sm font-medium">{document.requirement_name}</p><span className="text-xs text-muted-foreground">{document.satisfied_by_version_id ? "Ready" : "Missing file"}</span></div>)}{!documents.length && <p className="text-sm text-muted-foreground">Track what this application needs, then attach reusable file versions from your library.</p>}<Button variant="outline" size="sm" asChild><Link href={`/documents?application=${id}&tab=requirements`}>Manage requirements</Link></Button></div></CardContent></Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/essays/new?application=${id}`}>Add essay prompt</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/recommenders/new?application=${id}`}>Add recommender request</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/documents/new?application=${id}`}>Add document requirement</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/calendar/new?application=${id}`}>Add deadline</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Expenses
                  {totalExpenses > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      (Paid: {totalExpenses.toLocaleString()})
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category.replace(/_/g, " ")}
                            {expense.due_on && ` · Due ${new Date(expense.due_on).toLocaleDateString()}`}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{expense.notes}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium">
                            {expense.currency_code} {Number(expense.amount).toLocaleString()}
                          </p>
                          <StatusBadge
                            status={
                              expense.status === "paid" ? "done" :
                              expense.status === "waived" ? "exploring" :
                              expense.status === "due" ? "submitted" :
                              "draft"
                            }
                            label={expense.status}
                          />
                        </div>
                      </div>

                      {/* Inline edit form */}
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Edit expense
                        </summary>
                        <form action={updateExpenseFromForm} className="mt-2 space-y-2 border-t pt-2">
                          <input type="hidden" name="id" value={expense.id} />
                          <input type="hidden" name="application_id" value={id} />

                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input name="description" defaultValue={expense.description} placeholder="Description" />
                            <select name="category" defaultValue={expense.category} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                              {EXPENSE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input name="amount" type="number" min={0} step={0.01} defaultValue={expense.amount} />
                            <select name="currency_code" defaultValue={expense.currency_code} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                              {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.code}</option>
                              ))}
                            </select>
                            <select name="status" defaultValue={expense.status} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                              <option value="planned">Planned</option>
                              <option value="due">Due</option>
                              <option value="paid">Paid</option>
                              <option value="waived">Waived</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </div>

                          <Input name="due_on" type="date" defaultValue={expense.due_on || ""} />

                          <div className="flex gap-2">
                            <Button type="submit" size="sm" variant="outline">
                              <Pencil className="mr-1 h-3 w-3" />
                              Save
                            </Button>
                          </div>
                        </form>
                      </details>

                      {/* Archive button */}
                      <form action={archiveExpenseFromForm} className="mt-1">
                        <input type="hidden" name="id" value={expense.id} />
                        <input type="hidden" name="application_id" value={id} />
                        <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 px-2 text-xs">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {/* Create new expense */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Add expense
                </p>
                <form action={createExpenseFromForm} className="space-y-3">
                  <input type="hidden" name="application_id" value={application.id} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="description" required placeholder="e.g. Application fee" />
                    <select name="category" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input name="amount" type="number" min={0} step={0.01} required placeholder="0.00" />
                    <select name="currency_code" required className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Currency</option>
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <select name="status" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="planned">Planned</option>
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </div>

                  <Input name="due_on" type="date" />

                  <Button type="submit" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add expense
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/programs/${application.program_id}`}>View program</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/calendar?application=${application.id}`}>View deadlines</Link>
              </Button>
              <form action={async () => {
                "use server";
                await archiveApplication(application.id);
              }}>
                <Button type="submit" className="w-full" variant="ghost" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Archive application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
