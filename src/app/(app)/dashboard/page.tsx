import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  getApplications,
  getUpcomingDeadlines,
  getBlockingTasks,
  getTasks,
} from "@/features/programs/actions";
import { getFundingSummary } from "@/features/scholarships/actions";
import { ApplicationExplorer } from "@/components/domain/application-explorer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { FadeIn, MotionPanel } from "@/components/ui/motion-wrapper";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.split(" ")[0]
      : "";
  const [applications, allDeadlines, blockers, tasks, funding] = await Promise.all([
    getApplications(),
    getUpcomingDeadlines(30),
    getBlockingTasks(),
    getTasks(),
    getFundingSummary(),
  ]);
  const deadlines = allDeadlines.filter((deadline) => Number.isFinite(Date.parse(deadline.due_at)));
  const next = deadlines[0];
  const blocker = blockers[0];
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const submitted = applications.filter((application) =>
    ["submitted", "under_review", "interview", "waitlisted", "admitted", "enrolled"].includes(
      application.status,
    ),
  ).length;
  const admits = applications.filter((application) =>
    ["admitted", "enrolled"].includes(application.status),
  ).length;
  const focusTitle = blocker?.title || next?.title || "Find the place you’ll grow.";
  const focusHref = blocker?.application_id
    ? `/applications/${blocker.application_id}#tasks`
    : next?.application_id
      ? `/applications/${next.application_id}#deadlines`
      : next
        ? "/calendar"
        : "/programs";

  return (
    <div className="workspace-page">
      <FadeIn y={18}>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">YOUR APPLICATION WORKSPACE</p>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {name ? `Ready for your next move, ${name}?` : "Good things are ahead."}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              A fresh start, a clear plan, and a little momentum.
            </p>
          </div>
          <Button asChild className="h-11 rounded-xl">
            <Link href="/applications/new">
              <Plus size={17} /> New application
            </Link>
          </Button>
        </header>
      </FadeIn>
      <div className="mb-8 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <MotionPanel className="focus-panel relative overflow-hidden rounded-[28px] p-7 sm:p-9">
          <div aria-hidden="true" className="orbit-art">
            {/* <span /> */}
            {/* <span /> */}
            {/* <span /> */}
            {/* <Compass /> */}
          </div>
          <div className="relative z-10 max-w-md">
            <p className="text-primary mb-6 flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
              {blocker
                ? "LET’S UNBLOCK YOUR PROGRESS"
                : next
                  ? "YOUR NEXT MOVE"
                  : "A WORLD OF POSSIBILITIES"}
            </p>
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
              {focusTitle}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              {blocker
                ? `${blockers.length} outstanding blocking task${blockers.length === 1 ? " needs" : "s need"} your attention. Start with this one.`
                : next
                  ? "Give this deadline your attention today. A small step now makes the final stretch easier."
                  : "Discover a program that excites you, save it, and start shaping the path ahead."}
            </p>
            <Link
              href={focusHref}
              className="focus-action ui-button mt-7 inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              {blocker ? "Open task" : next ? "Review deadline" : "Explore programs"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </MotionPanel>
        <MotionPanel className="workspace-panel progress-panel flex flex-col justify-between p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow">YOUR MOMENTUM</p>
            <Compass size={20} className="text-primary" />
          </div>
          <div className="my-6 grid grid-cols-3 gap-3">
            {[
              { label: "Applications", value: applications.length },
              { label: "Submitted", value: submitted },
              { label: "Offers", value: admits },
            ].map((metric) => (
              <div key={metric.label}>
                <p className="text-4xl font-semibold tracking-tight tabular-nums">{metric.value}</p>
                <p className="text-muted-foreground mt-2 text-xs">{metric.label}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {completedTasks} task{completedTasks === 1 ? "" : "s"} completed
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {admits
                ? "You have an offer to celebrate. Take a moment to appreciate how far you’ve come."
                : "Your effort adds up. Keep moving at your own pace."}
            </p>
          </div>
        </MotionPanel>
      </div>
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <MotionPanel delay={0.1} interactive={false} className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Your applications</h2>
              <p className="text-muted-foreground mt-1 text-sm">Possibilities becoming plans.</p>
            </div>
            <Link href="/applications" className="text-primary text-sm font-medium hover:underline">
              View all ↗
            </Link>
          </div>
          <ApplicationExplorer applications={applications} />
        </MotionPanel>
        <div className="space-y-5">
          <MotionPanel delay={0.15} className="workspace-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Coming up next</h2>
              <CalendarDays size={18} className="text-muted-foreground" />
            </div>
            {deadlines.length ? (
              <div className="space-y-1">
                {deadlines.slice(0, 4).map((deadline) => (
                  <Link
                    key={deadline.id}
                    href={
                      deadline.application_id
                        ? `/applications/${deadline.application_id}#deadlines`
                        : "/calendar"
                    }
                    className="agenda-row group"
                  >
                    <div className="date-tile">
                      <span>
                        {new Date(deadline.due_at).toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                      <strong>{new Date(deadline.due_at).getDate()}</strong>
                    </div>
                    <div className="min-w-0">
                      <p className="group-hover:text-primary line-clamp-2 text-sm font-medium">
                        {deadline.title}
                      </p>
                      <div className="mt-1">
                        <DeadlineIndicator dueAt={deadline.due_at} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-muted/60 rounded-xl p-5">
                <p className="text-sm font-medium">A clear horizon.</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Add your deadlines so nothing catches you by surprise.
                </p>
              </div>
            )}
            <Link
              href="/calendar"
              className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-medium"
            >
              Open your calendar
              <ArrowRight size={16} />
            </Link>
          </MotionPanel>
          <MotionPanel delay={0.15} className="workspace-panel p-6">
            <p className="eyebrow mb-4">BUILD YOUR MOMENTUM</p>
            {[
              {
                href: "/essays",
                icon: FileText,
                title: "Tell your story",
                description: "Shape your essays and statements.",
              },
              {
                href: "/scholarships",
                icon: Award,
                title: "Fund your ambition",
                description: `${funding.scholarships.length} saved funding opportunities.`,
              },
              {
                href: "/recommenders",
                icon: CheckCircle2,
                title: "Bring your people along",
                description: "Keep recommendation requests moving.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="momentum-link group flex items-center gap-3 rounded-2xl p-3"
              >
                <item.icon size={19} className="text-primary shrink-0" />
                <div className="flex-1">
                  <p className="group-hover:text-primary text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{item.description}</p>
                </div>
                <ArrowUpRight size={15} className="text-muted-foreground" />
              </Link>
            ))}
          </MotionPanel>
        </div>
      </div>
    </div>
  );
}
