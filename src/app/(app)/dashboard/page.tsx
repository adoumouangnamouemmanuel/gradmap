import Link from "next/link";
import { BookOpen, Calendar, FileText, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Metric } from "@/components/domain/metric";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDashboardStats, getUpcomingDeadlines, getBlockingTasks } from "@/features/programs/actions";

export default async function DashboardPage() {
  let stats;
  let deadlines;
  let blockingTasks;

  try {
    [stats, deadlines, blockingTasks] = await Promise.all([
      getDashboardStats(),
      getUpcomingDeadlines(30),
      getBlockingTasks(),
    ]);
  } catch {
    // Not authenticated or no data - show empty state
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-[2rem]/[2.25rem] font-semibold tracking-tight sm:text-[2.5rem]/[2.75rem]">
            Welcome to GradMap
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your command center for graduate applications.
          </p>
        </div>

        <Card className="mb-6 border-primary/20 bg-primary/5">
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
          <Card><CardContent className="p-4"><Metric label="Programs" value={0} /></CardContent></Card>
          <Card><CardContent className="p-4"><Metric label="Applications" value={0} /></CardContent></Card>
          <Card><CardContent className="p-4"><Metric label="Deadlines" value={0} /></CardContent></Card>
          <Card><CardContent className="p-4"><Metric label="Tasks" value={0} /></CardContent></Card>
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Editorial greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem]/[2.25rem] font-semibold tracking-tight sm:text-[2.5rem]/[2.75rem]">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Emmanuel
        </h1>
        <p className="mt-1 text-muted-foreground">
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
      </div>

      {/* Next best action */}
      {nextDeadline && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
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
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
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

      {/* Pipeline metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <Metric label="Programs" value={stats.totalPrograms} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Metric label="Applications" value={stats.totalApplications} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Metric label="Submitted" value={stats.statusCounts.submitted || 0} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Metric label="Admits" value={stats.statusCounts.admitted || 0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming deadlines */}
        <Card className="lg:col-span-2">
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
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines.{" "}
                <Link href="/calendar" className="underline text-primary">
                  Add one
                </Link>
              </p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Application pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.statusCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet
              </p>
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
    </div>
  );
}
