"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select-input";
import { createDeadlineFromForm } from "@/features/programs/form-actions";
import { getApplications, getPrograms } from "@/features/programs/actions";

export default function NewDeadlinePage() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, setIsPending] = React.useState(false);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    Promise.all([getApplications(), getPrograms()]).then(([apps, progs]) => {
      setApplications(apps);
      setPrograms(progs);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const dueAt = formData.get("due_at") as string;
    const newErrors: Record<string, string> = {};
    if (!title?.trim()) newErrors.title = "Title is required";
    if (!dueAt) newErrors.due_at = "Due date is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      document.getElementById("field-title")?.focus();
      return;
    }

    setIsPending(true);
    try {
      const result = await createDeadlineFromForm(formData);
      if (result && typeof result === "object" && "error" in result && result.error) {
        setErrors({ title: result.error });
        setIsPending(false);
        return;
      }
      router.push("/calendar");
    } catch (err: any) {
      console.error("Error creating deadline:", err);
      setErrors({ title: err?.message || "Failed to create deadline" });
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href="/calendar"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Calendar
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add deadline</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Title" required error={errors.title} htmlFor="field-title">
              <Input
                id="field-title"
                name="title"
                required
                placeholder="e.g. Eiffel nomination deadline"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Due date" required error={errors.due_at} htmlFor="field-due_at">
                <Input id="field-due_at" name="due_at" type="datetime-local" required />
              </FormField>
              <FormField label="Type">
                <Select name="deadline_type">
                  <option value="custom">Custom</option>
                  <option value="funding">Funding</option>
                  <option value="priority">Priority</option>
                  <option value="final">Final</option>
                  <option value="document">Document</option>
                  <option value="decision">Decision</option>
                </Select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Link to application (optional)">
                <Select name="application_id">
                  <option value="">No linked application</option>
                  {applications.map((app: any) => (
                    <option key={app.id} value={app.id}>
                      {app.programs?.name} - {app.status?.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Link to program (optional)">
                <Select name="program_id">
                  <option value="">No linked program</option>
                  {programs.map((prog: any) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Source URL (optional)">
              <Input name="source_url" type="url" placeholder="https://..." />
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="Additional notes..."
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Create deadline"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/calendar">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
