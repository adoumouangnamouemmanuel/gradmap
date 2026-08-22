import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplications } from "@/features/programs/actions";
import { redirect } from "next/navigation";

export default async function NewEssayPromptPage() {
  const applications = await getApplications();

  async function handleCreate(formData: FormData) {
    "use server";
    const { createEssayPrompt } = await import("@/features/essays/actions");
    const title = formData.get("title") as string;
    if (!title) redirect("/essays/new?error=Title+is+required");
    const essay = await createEssayPrompt({
      title,
      prompt_text: formData.get("prompt_text") as string || undefined,
      word_limit: Number(formData.get("word_limit")) || undefined,
      character_limit: Number(formData.get("character_limit")) || undefined,
      application_id: formData.get("application_id") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
    redirect(`/essays/${essay.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/essays"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Essays
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add essay prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input id="title" name="title" required placeholder="e.g. Statement of Purpose" />
            </div>

            <div className="space-y-1">
              <label htmlFor="prompt_text" className="text-sm font-medium">Prompt text</label>
              <textarea
                id="prompt_text"
                name="prompt_text"
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="The full prompt text..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="word_limit" className="text-sm font-medium">Word limit</label>
                <Input id="word_limit" name="word_limit" type="number" min={1} placeholder="e.g. 500" />
              </div>
              <div className="space-y-1">
                <label htmlFor="character_limit" className="text-sm font-medium">Character limit</label>
                <Input id="character_limit" name="character_limit" type="number" min={1} placeholder="e.g. 3000" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="application_id" className="text-sm font-medium">Link to application (optional)</label>
              <select id="application_id" name="application_id" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">No linked application</option>
                {applications.map((app: any) => (
                  <option key={app.id} value={app.id}>
                    {app.programs?.name} — {app.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create prompt</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/essays">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
