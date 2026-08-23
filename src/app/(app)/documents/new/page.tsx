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
import { createClient } from "@/lib/supabase/client";

export default function NewDocumentPage() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const newErrors: Record<string, string> = {};
    if (!name?.trim()) newErrors.name = "Name is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      document.getElementById("field-name")?.focus();
      return;
    }

    setIsPending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          name,
          document_type: (formData.get("document_type") as string) || "other",
          notes: (formData.get("notes") as string) || null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("activity_events").insert({
        user_id: user.id,
        entity_type: "document",
        entity_id: data.id,
        action: "created",
        summary: `Created document: ${name}`,
      });

      router.push(`/documents/${data.id}`);
    } catch (err: any) {
      setErrors({ name: err?.message || "Failed to create document" });
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href="/documents"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Documents
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Name" required error={errors.name} htmlFor="field-name">
              <Input
                id="field-name"
                name="name"
                required
                placeholder="e.g. Transcript, CV, Diploma"
              />
            </FormField>

            <FormField label="Type">
              <Select name="document_type">
                <option value="other">Other</option>
                <option value="transcript">Transcript</option>
                <option value="diploma">Diploma</option>
                <option value="cv">CV / Resume</option>
                <option value="passport">Passport</option>
                <option value="recommendation_letter">Recommendation Letter</option>
                <option value="test_score">Test Score</option>
                <option value="financial_proof">Financial Proof</option>
                <option value="english_proficiency">English Proficiency</option>
                <option value="portfolio">Portfolio</option>
              </Select>
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
                {isPending ? "Saving..." : "Create document"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/documents">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
