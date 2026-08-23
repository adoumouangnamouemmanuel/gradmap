import Link from "next/link";
import {
  Calendar, FileText, Plus, TrendingUp,
  AlertTriangle, Award, DollarSign, Rocket, Wallet,
} from "lucide-react";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Metric } from "@/components/domain/metric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";
import { getDashboardStats, getUpcomingDeadlines, getBlockingTasks } from "@/features/programs/actions";
import { getFundingSummary, getExpenses } from "@/features/scholarships/actions";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function DashboardPage() {
  let stats, deadlines, blockingTasks, fundingSummary;
  let expenses: any[] = [];

  try {
    [stats, deadlines, blockingTasks, fundingSummary, expenses] = await Promise.all([
      getDashboardStats(), getUpcomingDeadlines(30), getBlockingTasks(), getFundingSummary(), getExpenses(),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 animate-content-enter">
          <h1 className="text-[34px] font-bold tracking-tight leading-[1.1]">Welcome to GradMap</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">Your command center for graduate applications.</p>
        </div>
        <Card className="border-primary/15 bg-primary/[0.04]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-primary/[0.08] text-primary"><TrendingUp className="h-5 w-5" /></div>
            <div className="flex-1"><p className="text-[15px] font-medium">Get started</p><p className="text-[13px] text-muted-foreground">Sign in to start tracking your graduate applications.</p></div>
            <Button size="sm" asChild className="rounded-[10px]"><Link href="/login">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextDeadline = deadlines[0];
  const daysUntil = nextDeadline ? Math.ceil((new Date(nextDeadline.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const hasZeroStats = stats.totalPrograms === 0 && stats.totalApplications === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Greeting */}
      <FadeIn delay={0.05} className="mb-5 sm:mb-6">
        <h1 className="text-[34px] sm:text-[34px] font-bold tracking-tight leading-[1.1]">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Emmanuel
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          2027 Intake · {daysUntil !== null ? <>Next deadline in <span className="font-medium text-foreground">{daysUntil} day{daysUntil !== 1 ? "s" : ""}</span></> : <span className="font-medium text-foreground">No upcoming deadlines</span>}
        </p>
      </FadeIn>

      {/* Next best action */}
      {nextDeadline && (
        <FadeIn delay={0.1}>
          <Card className="mb-5 border-primary/15 bg-primary/[0.04]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-primary/[0.08] text-primary"><TrendingUp className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium">Next best action</p>
                <p className="text-[13px] text-muted-foreground truncate">{nextDeadline.title} — due {daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`}</p>
              </div>
              <Button size="sm" asChild className="rounded-[10px]"><Link href="/calendar">View</Link></Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Blocking tasks */}
      {blockingTasks.length > 0 && (
        <FadeIn delay={0.12}>
          <Card className="mb-5 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"><AlertTriangle className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium">{blockingTasks.length} blocking task{blockingTasks.length !== 1 ? "s" : ""}</p>
                <p className="text-[13px] text-muted-foreground truncate">{blockingTasks.map((t: any) => t.title).join(", ")}</p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Metrics */}
      <StaggerContainer className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Programs", value: stats.totalPrograms },
          { label: "Applications", value: stats.totalApplications },
          { label: "Submitted", value: stats.statusCounts.submitted || 0 },
          { label: "Admits", value: stats.statusCounts.admitted || 0 },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <Card><CardContent className="p-4"><Metric label={stat.label} value={stat.value} /></CardContent></Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.25} className="grid gap-5 lg:grid-cols-3">
        {/* Deadlines */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[16px]"><Calendar className="h-4 w-4 text-muted-foreground/40" /> Upcoming deadlines</CardTitle>
              <Button size="sm" variant="outline" asChild className="rounded-[10px]"><Link href="/calendar">View all</Link></Button>
            </div>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-muted/50 text-muted-foreground/40"><Calendar className="h-5 w-5" /></div>
                <p className="text-[15px] font-medium">No upcoming deadlines</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Add a deadline to stay on track.</p>
              </div>
            ) : (
              <GroupedList>
                {deadlines.slice(0, 5).map((d: any, i: number) => (
                  <MobileListItem key={d.id} index={i} title={d.title} subtitle={d.deadline_type} indicator={<DeadlineIndicator dueAt={d.due_at} />} showChevron={false} />
                ))}
              </GroupedList>
            )}
          </CardContent>
        </Card>

        {/* Application pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px]"><FileText className="h-4 w-4 text-muted-foreground/40" /> Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.statusCounts).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-muted/50 text-muted-foreground/40"><Rocket className="h-5 w-5" /></div>
                <p className="text-[15px] font-medium">No applications yet</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Create an application to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-[14px]">
                    <span className="text-muted-foreground capitalize">{status.replace("_", " ")}</span>
                    <span className="font-medium tabular-nums">{count as number}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Scholarships */}
      {fundingSummary && fundingSummary.scholarships.length > 0 && (
        <FadeIn delay={0.3} className="mt-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[16px]"><Award className="h-4 w-4 text-muted-foreground/40" /> Scholarships</CardTitle>
                <Button size="sm" variant="outline" asChild className="rounded-[10px]"><Link href="/scholarships">View all</Link></Button>
              </div>
            </CardHeader>
            <CardContent>
              <GroupedList>
                {fundingSummary.scholarships.slice(0, 5).map((s: any, i: number) => (
                  <Link key={s.id} href={`/scholarships/${s.id}`}>
                    <MobileListItem index={i} title={s.name} subtitle={s.funding_type}
                      badge={<StatusBadge status={s.eligibility_status === "eligible" ? "done" : "preparing"} label={s.eligibility_status?.replace("_", " ")} />}
                    />
                  </Link>
                ))}
              </GroupedList>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Financial Summary */}
      {expenses.length > 0 && (
        <FadeIn delay={0.35} className="mt-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[16px]"><Wallet className="h-4 w-4 text-muted-foreground/40" /> Financial Summary</CardTitle>
                <Button size="sm" variant="outline" asChild className="rounded-[10px]"><Link href="/settings/profile">Details</Link></Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const totals: Record<string, { paid: number; planned: number }> = {};
                for (const e of expenses) {
                  const cur = e.currency_code || "USD";
                  if (!totals[cur]) totals[cur] = { paid: 0, planned: 0 };
                  if (e.status === "paid") totals[cur].paid += Number(e.amount) || 0;
                  else totals[cur].planned += Number(e.amount) || 0;
                }
                const FX: Record<string, number> = { GHS: 15.5, USD: 1, EUR: 0.92 };
                const toUSD = (amt: number, cur: string) => amt / (FX[cur] || 1);
                const totalPaidUSD = Object.entries(totals).reduce((s, [c, t]) => s + toUSD(t.paid, c), 0);
                const totalPlannedUSD = Object.entries(totals).reduce((s, [c, t]) => s + toUSD(t.planned, c), 0);
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {[{ code: "GHS", symbol: "GH₵", rate: 15.5 }, { code: "USD", symbol: "$", rate: 1 }, { code: "EUR", symbol: "€", rate: 0.92 }].map(({ code, symbol, rate }) => (
                      <div key={code} className="text-center">
                        <p className="text-[11px] font-medium text-muted-foreground/50 uppercase">{code}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Paid</p>
                        <p className="text-[16px] font-semibold text-emerald-600 tabular-nums">{symbol}{(totalPaidUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Planned</p>
                        <p className="text-[16px] font-semibold text-amber-600 tabular-nums">{symbol}{(totalPlannedUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
