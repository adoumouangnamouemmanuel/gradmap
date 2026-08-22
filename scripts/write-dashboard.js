const fs = require("fs");

const content = `import { BookOpen, Calendar, FileText, Plus, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Metric } from "@/components/domain/metric";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fixtureApplications, fixtureDeadlines, fixtureStats } from "@/lib/fixtures";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-[2rem]/[2.25rem] font-semibold tracking-tight sm:text-[2.5rem]/[2.75rem]">
          Good afternoon, Emmanuel
        </h1>
        <p className="mt-1 text-muted-foreground">
          2027 Intake · Next deadline in{" "}
          <span className="font-medium text-foreground">
            {fixtureStats.daysUntilNextDeadline} days
          </span>
        </p>
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Next best action</p>
            <p className="text-sm text-muted-foreground">
              ETH Zurich application is due in 2 days — complete your statement of purpose.
            </p>
          </div>
          <Button size="sm">View</Button>
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4"><Metric label="Programs" value={fixtureStats.totalPrograms} /></CardContent></Card>
        <Card><CardContent className="p-4"><Metric label="Shortlisted" value={fixtureStats.shortlisted} /></CardContent></Card>
        <Card><CardContent className="p-4"><Metric label="Submitted" value={fixtureStats.submitted} /></CardContent></Card>
        <Card><CardContent className="p-4"><Metric label="Admits" value={fixtureStats.admits} /></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="hidden sm:block">
              {fixtureDeadlines.map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.type}</p>
                    </div>
                    <DeadlineIndicator dueAt={d.dueAt} completed={d.completed} />
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
            <div className="space-y-2 sm:hidden">
              {fixtureDeadlines.map((d) => (
                <MobileListItem key={d.id} title={d.title} subtitle={d.type} indicator={<DeadlineIndicator dueAt={d.dueAt} completed={d.completed} />} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Funding outlook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Secured</p>
                <p className="font-serif text-lg font-semibold">{fixtureStats.fundingSecured}</p>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: "27%" }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">of {fixtureStats.fundingTarget} target</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Application pipeline</p>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Exploring</span><span className="font-medium">5</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Preparing</span><span className="font-medium">4</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Submitted</span><span className="font-medium">3</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Active applications
            </CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add program</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Program</span><span>Status</span><span>Deadline</span><span>Priority</span>
            </div>
            {fixtureApplications.map((app) => (
              <div key={app.id}>
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{app.programName}</p>
                    <p className="text-xs text-muted-foreground">{app.institution} · {app.country}</p>
                  </div>
                  <StatusBadge status={app.status} />
                  <DeadlineIndicator dueAt={app.deadline} />
                  <span className="text-sm font-medium">{app.priority}/5</span>
                </div>
                <Separator />
              </div>
            ))}
          </div>
          <div className="space-y-2 sm:hidden">
            {fixtureApplications.map((app) => (
              <MobileListItem key={app.id} title={app.programName} subtitle={app.institution + " · " + app.country} badge={<StatusBadge status={app.status} />} indicator={<DeadlineIndicator dueAt={app.deadline} />} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

fs.writeFileSync("src/app/(app)/dashboard/page.tsx", content);
console.log("dashboard page written successfully");
