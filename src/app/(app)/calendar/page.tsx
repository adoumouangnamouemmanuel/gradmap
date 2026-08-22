import { CalendarDays, Plus, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Separator } from "@/components/ui/separator";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";

export default async function CalendarPage() {
  const [deadlines, tasks] = await Promise.all([
    getUpcomingDeadlines(30),
    getTasks(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Calendar"
        description="Upcoming deadlines and tasks."
        action={
          <Button asChild>
            <a href="/calendar/new">
              <Plus className="mr-1 h-4 w-4" />
              Add deadline
            </a>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-1">
                {deadlines.map((d: any) => (
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
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Pending tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.filter((t: any) => t.status !== "done" && t.status !== "cancelled").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            ) : (
              <div className="space-y-1">
                {tasks
                  .filter((t: any) => t.status !== "done" && t.status !== "cancelled")
                  .slice(0, 10)
                  .map((task: any) => (
                    <div key={task.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
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
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Blocking</span>
                            )}
                          </div>
                        </div>
                        {task.due_at && (
                          <DeadlineIndicator dueAt={task.due_at} />
                        )}
                      </div>
                      <Separator />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
