"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { createClient } from "@/lib/supabase/client";

export default function EditInstitutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; country_name?: string; city?: string; website_url?: string; notes?: string }>;
}) {
  const { id } = React.use(params);
  const sp = React.use(searchParams);
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (!name?.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    setIsPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("institutions")
        .update({
          name,
          country_name: (formData.get("country_name") as string) || null,
          city: (formData.get("city") as string) || null,
          website_url: (formData.get("website_url") as string) || null,
          notes: (formData.get("notes") as string) || null,
        })
        .eq("id", id);

      if (error) throw error;
      router.push(`/institutions/${id}`);
      router.refresh();
    } catch (err: any) {
      setErrors({ name: err?.message || "Failed to update" });
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href={`/institutions/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to institution
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Edit institution</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Name" required error={errors.name} htmlFor="field-name">
              <Input id="field-name" name="name" required defaultValue={sp.name || ""} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Country">
                <Input name="country_name" defaultValue={sp.country_name || ""} />
              </FormField>
              <FormField label="City">
                <Input name="city" defaultValue={sp.city || ""} />
              </FormField>
            </div>

            <FormField label="Website URL">
              <Input name="website_url" type="url" defaultValue={sp.website_url || ""} placeholder="https://..." />
            </FormField>

            <FormField label="Notes">
              <textarea
                name="notes"
                rows={3}
                defaultValue={sp.notes || ""}
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/institutions/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
