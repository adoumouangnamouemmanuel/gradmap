import Link from "next/link";
import { CalendarDays, Plus, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function CalendarPage() {
  const [deadlines, tasks] = await Promise.all([
    getUpcomingDeadlines(30),
    getTasks(),
  ]);

  const pendingTasks = tasks.filter((t: any) => t.status !== "done" && t.status !== "cancelled");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Calendar"
        description="Upcoming deadlines and tasks."
        action={
          <Button asChild className="rounded-full">
            <Link href="/calendar/new">
              <Plus className="mr-1 h-4 w-4" />
              Add deadline
            </Link>
          </Button>
        }
      />

      <StaggerContainer className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Deadlines */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-medium">No upcoming deadlines</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Add a deadline to stay on track.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {deadlines.map((d: any, i: number) => (
                    <div
                      key={d.id}
                      className={`flex items-center justify-between py-3 ${
                        i < deadlines.length - 1 ? "border-b border-border/30" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate">{d.title}</p>
                        <p className="text-[12px] text-muted-foreground capitalize">{d.deadline_type}</p>
                      </div>
                      <DeadlineIndicator dueAt={d.due_at} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Tasks */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Pending tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-medium">No pending tasks</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {pendingTasks.slice(0, 10).map((task: any, i: number) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between py-3 ${
                        i < Math.min(pendingTasks.length, 10) - 1 ? "border-b border-border/30" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate">{task.title}</p>
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
                            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Blocking</span>
                          )}
                        </div>
                      </div>
                      {task.due_at && (
                        <DeadlineIndicator dueAt={task.due_at} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
