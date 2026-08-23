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
import { getInstitutions } from "@/features/programs/actions";

export default function NewContactPage() {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, setIsPending] = React.useState(false);
  const [institutions, setInstitutions] = React.useState<any[]>([]);

  React.useEffect(() => {
    getInstitutions().then(setInstitutions);
  }, []);

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
      const { createContact } = await import("@/features/essays/actions");
      await createContact({
        name,
        email: formData.get("email") as string || undefined,
        phone: formData.get("phone") as string || undefined,
        role: formData.get("role") as string || undefined,
        institution: formData.get("institution") as string || undefined,
        notes: formData.get("notes") as string || undefined,
      });
      router.push("/contacts");
    } catch (err: any) {
      setErrors({ name: err?.message || "Failed to create contact" });
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href="/contacts"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Name" required error={errors.name} htmlFor="field-name">
              <Input id="field-name" name="name" required placeholder="e.g. Dr. Marie Curie" />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="field-email">
                <Input id="field-email" name="email" type="email" placeholder="contact@university.fr" />
              </FormField>
              <FormField label="Phone" htmlFor="field-phone">
                <Input id="field-phone" name="phone" type="tel" placeholder="+33 1 23 45 67 89" />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Role" htmlFor="field-role">
                <Input id="field-role" name="role" placeholder="e.g. Admissions Officer" />
              </FormField>
              <FormField label="Institution" htmlFor="field-institution">
                <Select id="field-institution" name="institution">
                  <option value="">Select institution...</option>
                  {institutions.map((inst: any) => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name}{inst.country_name ? `, ${inst.country_name}` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Notes" htmlFor="field-notes">
              <textarea
                id="field-notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="Notes about this contact..."
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add contact"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/contacts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
