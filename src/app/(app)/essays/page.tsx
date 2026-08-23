import Link from "next/link";
import { Plus, PenTool } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getEssayPrompts } from "@/features/essays/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default async function EssaysPage() {
  const prompts = await getEssayPrompts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Essays"
        description="Track essay prompts, drafts and versions."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/essays/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Add essay prompt</span>
            </Link>
          </Button>
        }
      />

      {prompts.length === 0 ? (
        <EmptyState icon={<PenTool className="h-7 w-7" />} title="No essay prompts yet" description="Add essay prompts from your applications to start tracking drafts." action={{ label: "Add first essay prompt", href: "/essays/new" }} />
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-0">
                  {prompts.map((prompt: any) => (
                    <Link key={prompt.id} href={`/essays/${prompt.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{prompt.title}</p>
                        {prompt.applications?.programs?.name && <p className="text-[13px] text-muted-foreground">{prompt.applications.programs.name}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[13px] text-muted-foreground">{prompt.word_limit || "—"}</span>
                        <StatusBadge status={prompt.status === "final" || prompt.status === "submitted" ? "done" : prompt.status === "drafting" || prompt.status === "reviewing" ? "preparing" : "draft"} label={prompt.status.replace(/_/g, " ")} />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.1}>
              <GroupedList>
                {prompts.map((prompt: any, i: number) => (
                  <Link key={prompt.id} href={`/essays/${prompt.id}`}>
                    <MobileListItem index={i} title={prompt.title} subtitle={prompt.applications?.programs?.name || "General"}
                      badge={<StatusBadge status={prompt.status === "final" || prompt.status === "submitted" ? "done" : "draft"} label={prompt.status.replace(/_/g, " ")} />}
                    />
                  </Link>
                ))}
              </GroupedList>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
