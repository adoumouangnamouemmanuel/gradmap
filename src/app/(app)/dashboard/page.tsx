import Link from "next/link";
import {
  BookOpen, Calendar, FileText, Plus, TrendingUp,
  AlertTriangle, Award, DollarSign, Rocket, ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Metric } from "@/components/domain/metric";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDashboardStats, getUpcomingDeadlines, getBlockingTasks } from "@/features/programs/actions";
import { getFundingSummary } from "@/features/scholarships/actions";

export default async function DashboardPage() {
  let stats;
  let deadlines;
  let blockingTasks;
  let fundingSummary;

  try {
    [stats, deadlines, blockingTasks, fundingSummary] = await Promise.all([
      getDashboardStats(),
      getUpcomingDeadlines(30),
      getBlockingTasks(),
      getFundingSummary(),
    ]);
  } catch {
    // Not authenticated or no data - show empty state
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem]/[2.75rem]">
            Welcome to GradMap
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground tracking-tight">
            Your command center for graduate applications.
          </p>
        </div>

        <Card className="mb-6 shadow-sm border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Get started</p>
              <p className="text-sm text-muted-foreground">
                Sign in to start tracking your graduate applications.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="shadow-sm"><CardContent className="p-4"><Metric label="Programs" value={0} /></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-4"><Metric label="Applications" value={0} /></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-4"><Metric label="Deadlines" value={0} /></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-4"><Metric label="Tasks" value={0} /></CardContent></Card>
        </div>
      </div>
    );
  }

  const nextDeadline = deadlines[0];
  const daysUntilDeadline = nextDeadline
    ? Math.ceil(
        (new Date(nextDeadline.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const hasZeroStats =
    stats.totalPrograms === 0 &&
    stats.totalApplications === 0 &&
    (!fundingSummary || (fundingSummary.scholarships.length === 0 && fundingSummary.expenses.length === 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Editorial greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem]/[2.75rem]">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Emmanuel
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground tracking-tight">
          2027 Intake ·{" "}
          {daysUntilDeadline !== null ? (
            <>
              Next deadline in{" "}
              <span className="font-medium text-foreground">
                {daysUntilDeadline} day{daysUntilDeadline !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span className="font-medium text-foreground">No upcoming deadlines</span>
          )}
        </p>
        {hasZeroStats && (
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first program to start tracking deadlines and applications.
          </p>
        )}
      </div>

      {/* Next best action */}
      {nextDeadline && (
        <Card className="mb-6 shadow-sm border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Next best action</p>
              <p className="text-sm text-muted-foreground">
                {nextDeadline.title} — due {daysUntilDeadline === 0 ? "today" : daysUntilDeadline === 1 ? "tomorrow" : `in ${daysUntilDeadline} days`}.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/calendar">View</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blocking tasks alert */}
      {blockingTasks.length > 0 && (
        <Card className="mb-6 shadow-sm border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{blockingTasks.length} blocking task{blockingTasks.length !== 1 ? "s" : ""}</p>
              <p className="text-sm text-muted-foreground">
                {blockingTasks.map((t: any) => t.title).join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline metrics — staggered entrance + hover lift */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Programs", value: stats.totalPrograms },
          { label: "Applications", value: stats.totalApplications },
          { label: "Submitted", value: stats.statusCounts.submitted || 0 },
          { label: "Admits", value: stats.statusCounts.admitted || 0 },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className={`shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-stagger-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4">
              <Metric label={stat.label} value={stat.value} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming deadlines */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Upcoming deadlines
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href="/calendar">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {deadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No upcoming deadlines</p>
                <p className="mt-1 text-xs text-muted-foreground">Add a deadline to stay on track.</p>
                <Button size="sm" asChild className="mt-3">
                  <Link href="/calendar">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add deadline
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block">
                  {deadlines.slice(0, 5).map((d: any) => (
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
                {/* Mobile list */}
                <div className="space-y-2 sm:hidden">
                  {deadlines.slice(0, 5).map((d: any) => (
                    <MobileListItem
                      key={d.id}
                      title={d.title}
                      subtitle={d.deadline_type}
                      indicator={<DeadlineIndicator dueAt={d.due_at} />}
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application pipeline */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Application pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.statusCounts).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Rocket className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No applications yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Create an application to start your pipeline.</p>
                <Button size="sm" asChild className="mt-3">
                  <Link href="/applications/new">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    New application
                  </Link>
                </Button>
              </div>
            ) : (
              Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{status.replace("_", " ")}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funding summary */}
      {fundingSummary && (fundingSummary.scholarships.length > 0 || fundingSummary.expenses.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Scholarships overview */}
          {fundingSummary.scholarships.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-serif text-lg">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Scholarships
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/scholarships">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {fundingSummary.scholarships.slice(0, 5).map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/scholarships/${s.id}`}
                    className="flex items-center justify-between py-2 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{s.funding_type}</p>
                    </div>
                    <div className="text-right">
                      {s.amount && (
                        <p className="text-sm font-medium">
                          {s.currency_code} {s.amount.toLocaleString()}
                        </p>
                      )}
                      <StatusBadge
                        status={
                          s.eligibility_status === "eligible" ? "done" :
                          s.eligibility_status === "likely" ? "preparing" :
                          "exploring"
                        }
                        label={s.eligibility_status.replace("_", " ")}
                      />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Expenses overview */}
          {fundingSummary.expenses.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-serif text-lg">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Expenses
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/applications">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {fundingSummary.expenses.slice(0, 5).map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{e.category.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {e.currency_code} {Number(e.amount).toLocaleString()}
                      </p>
                      <StatusBadge
                        status={
                          e.status === "paid" ? "done" :
                          e.status === "due" ? "submitted" :
                          "draft"
                        }
                        label={e.status}
                      />
                    </div>
                  </div>
                ))}
                {fundingSummary.totalExpenses > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium">Total paid</span>
                      <span className="text-sm font-medium text-primary">
                        {fundingSummary.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
