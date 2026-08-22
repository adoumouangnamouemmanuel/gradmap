import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrograms } from "@/features/programs/actions";
import { redirect } from "next/navigation";
import { APPLICATION_STATUSES } from "@/lib/constants";

export default async function NewApplicationPage() {
  const programs = await getPrograms();

  async function handleCreate(formData: FormData) {
    "use server";
    const { createApplicationFromForm } = await import("@/features/programs/form-actions");
    await createApplicationFromForm(formData);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Applications
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">New application</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="program_id" className="text-sm font-medium">
                Program *
              </label>
              <select
                id="program_id"
                name="program_id"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a program</option>
                {programs.map((program: any) => (
                  <option key={program.id} value={program.id}>
                    {program.name} — {program.institutions?.name || "Unknown institution"}
                  </option>
                ))}
              </select>
              {programs.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No programs found. <Link href="/programs/new" className="text-primary hover:underline">Create one first</Link>.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="priority" className="text-sm font-medium">Priority (1-5)</label>
                <Input id="priority" name="priority" type="number" defaultValue={3} min={1} max={5} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="application_round" className="text-sm font-medium">Application round</label>
                <Input id="application_round" name="application_round" placeholder="e.g. Main, Early" />
              </div>
              <div className="space-y-1">
                <label htmlFor="portal_url" className="text-sm font-medium">Portal URL</label>
                <Input id="portal_url" name="portal_url" type="url" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this application..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create application</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/applications">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
