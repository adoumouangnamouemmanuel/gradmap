"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { createScholarshipWithPrograms } from "@/features/scholarships/form-actions";
import {
  CURRENCIES,
  FUNDING_TYPES,
  FUNDING_TYPE_LABELS,
  SCHOLARSHIP_MECHANISMS,
  SCHOLARSHIP_MECHANISM_LABELS,
  ELIGIBILITY_STATUSES,
} from "@/lib/constants";

interface Props {
  programs: any[];
}

export default function NewScholarshipForm({ programs }: Props) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (!name?.trim()) {
      setErrors({ name: "Scholarship name is required" });
      document.getElementById("field-name")?.focus();
      return;
    }
    setErrors({});
    startTransition(() => {
      createScholarshipWithPrograms(formData);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <Link
        href="/scholarships"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Scholarships
      </Link>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add a scholarship</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Core info */}
            <FormField label="Scholarship name" required error={errors.name} htmlFor="field-name">
              <Input id="field-name" name="name" required placeholder="e.g. Eiffel Excellence Scholarship" />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Provider">
                <Input name="provider" placeholder="e.g. Campus France" />
              </FormField>
              <FormField label="Official URL">
                <Input name="official_url" type="url" placeholder="https://..." />
              </FormField>
            </div>

            {/* Funding */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Funding</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Funding type">
                  <Select name="funding_type">
                    {FUNDING_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{FUNDING_TYPE_LABELS[ft]}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Application mechanism">
                  <Select name="application_mechanism">
                    {SCHOLARSHIP_MECHANISMS.map((m) => (
                      <option key={m} value={m}>{SCHOLARSHIP_MECHANISM_LABELS[m]}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Amount">
                  <Input name="amount" type="number" min={0} step={0.01} placeholder="e.g. 14400" />
                </FormField>
                <FormField label="Currency">
                  <Select name="currency_code">
                    <option value="">Select</option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="Coverage notes">
                <textarea
                  name="coverage_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="e.g. €1,200 per month, travel allowance, direct services"
                />
              </FormField>
            </div>

            {/* Eligibility */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eligibility</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Eligibility status">
                  <Select name="eligibility_status">
                    {ELIGIBILITY_STATUSES.map((es) => (
                      <option key={es} value={es}>{es.replace(/_/g, " ")}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Priority (1-5)">
                  <Input name="display_priority" type="number" defaultValue={3} min={1} max={5} />
                </FormField>
              </div>

              <FormField label="Eligibility notes">
                <textarea
                  name="eligibility_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Notes about eligibility requirements..."
                />
              </FormField>

              <FormField label="Service obligations">
                <textarea
                  name="service_obligation_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="e.g. Return service requirement after graduation..."
                />
              </FormField>
            </div>

            {/* Program linking */}
            {programs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link to programs</h3>
                <p className="text-xs text-muted-foreground">
                  Select which programs this scholarship is compatible with.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                  {programs.map((program: any) => (
                    <label
                      key={program.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        name="program_ids"
                        value={program.id}
                        className="rounded border-input"
                      />
                      <span className="truncate">{program.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Create scholarship"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/scholarships">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
