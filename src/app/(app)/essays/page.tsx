import Link from "next/link";
import { Plus, PenTool, FileText } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getEssayPrompts } from "@/features/essays/actions";

export default async function EssaysPage() {
  const prompts = await getEssayPrompts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Essays"
        description="Track essay prompts, drafts and versions."
        action={
          <Button asChild>
            <Link href="/essays/new">
              <Plus className="mr-1 h-4 w-4" />
              Add essay prompt
            </Link>
          </Button>
        }
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={<PenTool className="h-6 w-6" />}
          title="No essay prompts yet"
          description="Add essay prompts from your applications to start tracking drafts."
          action={{ label: "Add first essay prompt", href: "/essays/new" }}
        />
      ) : (
        <>
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Essay</span>
                  <span>Word Limit</span>
                  <span>Status</span>
                </div>
                {prompts.map((prompt: any) => (
                  <Link
                    key={prompt.id}
                    href={`/essays/${prompt.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{prompt.title}</p>
                      {prompt.applications?.programs?.name && (
                        <p className="text-xs text-muted-foreground">
                          {prompt.applications.programs.name}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {prompt.word_limit ? `${prompt.word_limit}` : "—"}
                    </span>
                    <StatusBadge
                      status={
                        prompt.status === "final" || prompt.status === "submitted" ? "done" :
                        prompt.status === "drafting" || prompt.status === "reviewing" ? "preparing" :
                        "draft"
                      }
                      label={prompt.status.replace(/_/g, " ")}
                    />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {prompts.map((prompt: any) => (
              <Link key={prompt.id} href={`/essays/${prompt.id}`}>
                <MobileListItem
                  title={prompt.title}
                  subtitle={prompt.applications?.programs?.name || "General"}
                  badge={
                    <StatusBadge
                      status={
                        prompt.status === "final" || prompt.status === "submitted" ? "done" :
                        prompt.status === "drafting" || prompt.status === "reviewing" ? "preparing" :
                        "draft"
                      }
                      label={prompt.status.replace(/_/g, " ")}
                    />
                  }
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
