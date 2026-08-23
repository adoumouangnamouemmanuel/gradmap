import Link from "next/link";
import { CalendarDays, Plus, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";
import { getUpcomingDeadlines, getTasks } from "@/features/programs/actions";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function CalendarPage() {
  const [deadlines, tasks] = await Promise.all([getUpcomingDeadlines(30), getTasks()]);
  const pendingTasks = tasks.filter((t: any) => t.status !== "done" && t.status !== "cancelled");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Calendar" description="Upcoming deadlines and tasks."
        action={<Button asChild className="rounded-[12px]"><Link href="/calendar/new"><Plus className="mr-1 h-4 w-4" /> Add deadline</Link></Button>}
      />

      <StaggerContainer className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Deadlines */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <CalendarDays className="h-4 w-4 text-muted-foreground/40" /> Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-muted/50 text-muted-foreground/40">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <p className="text-[15px] font-medium">No upcoming deadlines</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Add a deadline to stay on track.</p>
                </div>
              ) : (
                <GroupedList>
                  {deadlines.map((d: any, i: number) => (
                    <MobileListItem key={d.id} index={i} title={d.title} subtitle={d.deadline_type} indicator={<DeadlineIndicator dueAt={d.due_at} />} showChevron={false} />
                  ))}
                </GroupedList>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Tasks */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" /> Pending tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-muted/50 text-muted-foreground/40">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-[15px] font-medium">No pending tasks</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                <GroupedList>
                  {pendingTasks.slice(0, 10).map((task: any, i: number) => (
                    <MobileListItem key={task.id} index={i} title={task.title}
                      subtitle={task.blocking ? "Blocking" : undefined}
                      indicator={<StatusBadge status={task.status === "in_progress" ? "preparing" : "draft"} label={task.status.replace("_", " ")} />}
                      showChevron={false}
                    />
                  ))}
                </GroupedList>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
