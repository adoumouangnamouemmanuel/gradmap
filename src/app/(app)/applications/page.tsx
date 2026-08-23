import Link from "next/link";
import { Plus, FileText, DollarSign, Award } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getApplications } from "@/features/programs/actions";
import { getScholarshipApplications, getExpenses } from "@/features/scholarships/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default async function ApplicationsPage() {
  const [applications, scholarshipApplications, expenses] = await Promise.all([
    getApplications(), getScholarshipApplications(), getExpenses(),
  ]);

  const totalExpenses = expenses
    .filter((e: any) => e.status === "paid")
    .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Applications"
        description="Track your program applications and their status."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/applications/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">New application</span>
            </Link>
          </Button>
        }
      />

      {applications.length === 0 && scholarshipApplications.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No applications yet"
          description="Create an application from a program page to start tracking."
          action={{ label: "Browse programs", href: "/programs" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border/30 bg-muted/20 px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Program</span><span>Status</span><span>Priority</span><span>Round</span>
                  </div>
                  {applications.map((app: any) => (
                    <Link key={app.id} href={`/applications/${app.id}`}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{app.programs?.name}</p>
                        <p className="text-[13px] text-muted-foreground">{app.programs?.institutions?.name} · {app.programs?.institutions?.country_name}</p>
                      </div>
                      <StatusBadge status={app.status === "submitted" ? "submitted" : app.status === "admitted" ? "done" : app.status === "rejected" ? "blocked" : app.status === "preparing" || app.status === "ready" ? "preparing" : "exploring"} label={app.status} />
                      <span className="text-[14px] font-medium">{app.priority}/5</span>
                      <span className="text-[13px] text-muted-foreground">{app.application_round || "—"}</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Mobile grouped list */}
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.1}>
              <GroupedList>
                {applications.map((app: any, i: number) => (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <MobileListItem
                      index={i}
                      title={app.programs?.name || "Application"}
                      subtitle={`${app.programs?.institutions?.name || ""} · ${app.programs?.institutions?.country_name || ""}`}
                      badge={
                        <StatusBadge status={app.status === "submitted" ? "submitted" : app.status === "admitted" ? "done" : app.status === "rejected" ? "blocked" : "preparing"} label={app.status} />
                      }
                    />
                  </Link>
                ))}
              </GroupedList>
            </FadeIn>
          </div>
        </>
      )}

      {/* Scholarship Applications */}
      {scholarshipApplications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[20px] font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground/40" /> Scholarship Applications
          </h2>
          <div className="mt-4 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                {scholarshipApplications.map((sa: any) => (
                  <Link key={sa.id} href={`/scholarships/${sa.scholarship_id}`}
                    className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium truncate">{sa.scholarships?.name}</p>
                      <p className="text-[13px] text-muted-foreground">{sa.scholarships?.provider || sa.scholarships?.funding_type}</p>
                    </div>
                    <StatusBadge status={sa.status === "awarded" ? "done" : sa.status === "submitted" ? "submitted" : "preparing"} label={sa.status.replace("_", " ")} />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 sm:hidden">
            <GroupedList>
              {scholarshipApplications.map((sa: any, i: number) => (
                <Link key={sa.id} href={`/scholarships/${sa.scholarship_id}`}>
                  <MobileListItem index={i} title={sa.scholarships?.name || "Scholarship"} subtitle={sa.scholarships?.provider || ""} badge={<StatusBadge status={sa.status === "awarded" ? "done" : "preparing"} label={sa.status.replace("_", " ")} />} />
                </Link>
              ))}
            </GroupedList>
          </div>
        </div>
      )}

      {/* Expenses */}
      {expenses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[20px] font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground/40" /> Expenses
            {totalExpenses > 0 && <span className="text-[14px] font-normal text-muted-foreground">(Paid: {totalExpenses.toLocaleString()})</span>}
          </h2>
          <div className="mt-4 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                {expenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium truncate">{expense.description}</p>
                      <p className="text-[13px] text-muted-foreground capitalize">{expense.category.replace("_", " ")}{expense.due_on ? ` · Due ${new Date(expense.due_on).toLocaleDateString()}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-medium">{expense.currency_code} {Number(expense.amount).toLocaleString()}</p>
                      <StatusBadge status={expense.status === "paid" ? "done" : expense.status === "due" ? "submitted" : "draft"} label={expense.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
