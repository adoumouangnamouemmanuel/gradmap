import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default function NewRecommenderPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const { createRecommender } = await import("@/features/essays/actions");
    const name = formData.get("name") as string;
    if (!name) redirect("/recommenders/new?error=Name+is+required");
    await createRecommender({
      name,
      email: formData.get("email") as string || undefined,
      title: formData.get("title") as string || undefined,
      institution: formData.get("institution") as string || undefined,
      relationship: formData.get("relationship") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
    redirect("/recommenders");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/recommenders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Recommenders
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add recommender</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Name *</label>
              <Input id="name" name="name" required placeholder="e.g. Prof. Jean Dupont" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" placeholder="professor@university.fr" />
              </div>
              <div className="space-y-1">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input id="title" name="title" placeholder="e.g. Professor of Computer Science" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="institution" className="text-sm font-medium">Institution</label>
                <Input id="institution" name="institution" placeholder="e.g. University of Lille" />
              </div>
              <div className="space-y-1">
                <label htmlFor="relationship" className="text-sm font-medium">Relationship</label>
                <Input id="relationship" name="relationship" placeholder="e.g. Thesis supervisor" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this recommender..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Add recommender</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/recommenders">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
