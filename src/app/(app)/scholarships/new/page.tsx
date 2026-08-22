import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createScholarshipWithPrograms } from "@/features/scholarships/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrograms } from "@/features/programs/actions";
import {
  CURRENCIES,
  FUNDING_TYPES,
  FUNDING_TYPE_LABELS,
  SCHOLARSHIP_MECHANISMS,
  SCHOLARSHIP_MECHANISM_LABELS,
  ELIGIBILITY_STATUSES,
} from "@/lib/constants";

export default async function NewScholarshipPage() {
  const programs = await getPrograms();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/scholarships"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Scholarships
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add a scholarship</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createScholarshipWithPrograms} className="space-y-6">
            {/* Core info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">
                  Scholarship name *
                </label>
                <Input id="name" name="name" required placeholder="e.g. Eiffel Excellence Scholarship" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="provider" className="text-sm font-medium">
                    Provider
                  </label>
                  <Input id="provider" name="provider" placeholder="e.g. Campus France" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="official_url" className="text-sm font-medium">
                    Official URL
                  </label>
                  <Input id="official_url" name="official_url" type="url" placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Funding */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Funding</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="funding_type" className="text-sm font-medium">
                    Funding type
                  </label>
                  <select id="funding_type" name="funding_type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    {FUNDING_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{FUNDING_TYPE_LABELS[ft]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="application_mechanism" className="text-sm font-medium">
                    Application mechanism
                  </label>
                  <select id="application_mechanism" name="application_mechanism" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    {SCHOLARSHIP_MECHANISMS.map((m) => (
                      <option key={m} value={m}>{SCHOLARSHIP_MECHANISM_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </label>
                  <Input id="amount" name="amount" type="number" min={0} step={0.01} placeholder="e.g. 14400" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="currency_code" className="text-sm font-medium">
                    Currency
                  </label>
                  <select id="currency_code" name="currency_code" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select</option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="coverage_notes" className="text-sm font-medium">
                  Coverage notes
                </label>
                <textarea
                  id="coverage_notes"
                  name="coverage_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  placeholder="e.g. €1,200 per month, travel allowance, direct services"
                />
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eligibility</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="eligibility_status" className="text-sm font-medium">
                    Eligibility status
                  </label>
                  <select id="eligibility_status" name="eligibility_status" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    {ELIGIBILITY_STATUSES.map((es) => (
                      <option key={es} value={es}>{es.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="display_priority" className="text-sm font-medium">
                    Priority (1-5)
                  </label>
                  <Input id="display_priority" name="display_priority" type="number" defaultValue={3} min={1} max={5} />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="eligibility_notes" className="text-sm font-medium">
                  Eligibility notes
                </label>
                <textarea
                  id="eligibility_notes"
                  name="eligibility_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  placeholder="Notes about eligibility requirements..."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="service_obligation_notes" className="text-sm font-medium">
                  Service obligations
                </label>
                <textarea
                  id="service_obligation_notes"
                  name="service_obligation_notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  placeholder="e.g. Return service requirement after graduation..."
                />
              </div>
            </div>

            {/* Program linking */}
            {programs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link to programs</h3>
                <p className="text-xs text-muted-foreground">
                  Select which programs this scholarship is compatible with.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto border rounded-lg p-3">
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
              <Button type="submit">Create scholarship</Button>
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
