import Link from "next/link";
import { Plus, FileText, DollarSign, Award } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getApplications } from "@/features/programs/actions";
import { getScholarshipApplications, getExpenses } from "@/features/scholarships/actions";

export default async function ApplicationsPage() {
  const [applications, scholarshipApplications, expenses] = await Promise.all([
    getApplications(),
    getScholarshipApplications(),
    getExpenses(),
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
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="mr-1 h-4 w-4" />
              New application
            </Link>
          </Button>
        }
      />

      {/* Program Applications */}
      {applications.length === 0 && scholarshipApplications.length === 0 ? (
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
                    href={`/applications/${app.id}`}
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
              <Link key={app.id} href={`/applications/${app.id}`}>
                <MobileListItem
                  title={app.programs?.name || "Application"}
                  subtitle={`${app.programs?.institutions?.name} · ${app.programs?.institutions?.country_name || ""}`}
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

      {/* Scholarship Applications */}
      {scholarshipApplications.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            Scholarship Applications
          </h2>
          <div className="hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Scholarship</span>
                  <span>Status</span>
                  <span>Award</span>
                </div>
                {scholarshipApplications.map((sa: any) => (
                  <Link
                    key={sa.id}
                    href={`/scholarships/${sa.scholarship_id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sa.scholarships?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sa.scholarships?.provider || sa.scholarships?.funding_type}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        sa.status === "awarded" ? "done" :
                        sa.status === "submitted" ? "submitted" :
                        sa.status === "rejected" ? "blocked" :
                        "preparing"
                      }
                      label={sa.status.replace("_", " ")}
                    />
                    <span className="text-sm font-medium">
                      {sa.award_amount
                        ? `${sa.award_currency_code || ""} ${sa.award_amount.toLocaleString()}`
                        : "—"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Expenses */}
      {expenses.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Expenses
            {totalExpenses > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                (Total paid: {totalExpenses.toLocaleString()})
              </span>
            )}
          </h2>
          <div className="hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Description</span>
                  <span>Category</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {expenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      {expense.due_on && (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(expense.due_on).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {expense.category.replace("_", " ")}
                    </span>
                    <span className="text-sm font-medium">
                      {expense.currency_code} {Number(expense.amount).toLocaleString()}
                    </span>
                    <StatusBadge
                      status={
                        expense.status === "paid" ? "done" :
                        expense.status === "waived" ? "exploring" :
                        expense.status === "refunded" ? "preparing" :
                        expense.status === "due" ? "submitted" :
                        "draft"
                      }
                      label={expense.status}
                    />
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
