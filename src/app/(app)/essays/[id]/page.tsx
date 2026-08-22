import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PenTool, Clock, Plus } from "lucide-react";
import { getEssayPrompt, updateEssayPromptStatus, createEssayVersion } from "@/features/essays/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function EssayPromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let prompt;
  try {
    prompt = await getEssayPrompt(id);
  } catch {
    notFound();
  }

  const versions = (prompt.essay_versions || [])
    .sort((a: any, b: any) => b.version_number - a.version_number);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/essays"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Essays
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {prompt.title}
            </h1>
            {prompt.prompt_text && (
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl whitespace-pre-wrap">
                {prompt.prompt_text}
              </p>
            )}
          </div>
          <StatusBadge
            status={
              prompt.status === "final" || prompt.status === "submitted" ? "done" :
              prompt.status === "drafting" || prompt.status === "reviewing" ? "preparing" :
              "draft"
            }
            label={prompt.status.replace(/_/g, " ")}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Versions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No versions yet.</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((v: any) => (
                    <div key={v.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Version {v.version_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.word_count} words · {v.character_count} characters
                            {v.notes && ` · ${v.notes}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {v.content && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                          {v.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New version form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Add new version</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={async (formData: FormData) => {
                "use server";
                await createEssayVersion({
                  essay_prompt_id: id,
                  content: formData.get("content") as string,
                  notes: formData.get("notes") as string || undefined,
                });
              }} className="space-y-3">
                <textarea
                  name="content"
                  rows={8}
                  required
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground font-mono"
                  placeholder="Paste or type your essay content here..."
                />
                <Input name="notes" placeholder="Version notes (optional)" />
                <Button type="submit" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Save version
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prompt.word_limit && (
                <div className="flex items-center gap-2 text-sm">
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Word limit:</span>
                  <span className="font-medium">{prompt.word_limit}</span>
                </div>
              )}
              {prompt.character_limit && (
                <div className="flex items-center gap-2 text-sm">
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Char limit:</span>
                  <span className="font-medium">{prompt.character_limit}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(prompt.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["not_started", "outlining", "drafting", "reviewing", "final", "submitted"].map((status) => (
                <form key={status} action={async () => {
                  "use server";
                  await updateEssayPromptStatus(id, status);
                }}>
                  <Button
                    type="submit"
                    variant={prompt.status === status ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    size="sm"
                  >
                    {status.replace(/_/g, " ")}
                  </Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
