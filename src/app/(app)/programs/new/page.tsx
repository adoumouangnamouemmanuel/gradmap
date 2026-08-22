import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProgramFromForm } from "@/features/programs/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstitutions } from "@/features/programs/actions";
import { DEGREE_TYPES } from "@/lib/constants";

export default async function NewProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string }>;
}) {
  const institutions = await getInstitutions();
  const { institution: preselectedInstitution } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/programs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Programs
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add a program</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProgramFromForm} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="institution_id" className="text-sm font-medium">
                Institution *
              </label>
              <select
                id="institution_id"
                name="institution_id"
                required
                defaultValue={preselectedInstitution || ""}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select an institution</option>
                {institutions.map((inst: any) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                    {inst.country_name ? `, ${inst.country_name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Program name *
              </label>
              <Input id="name" name="name" required placeholder="e.g. MSc Artificial Intelligence" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="degree_type" className="text-sm font-medium">
                  Degree type
                </label>
                <select id="degree_type" name="degree_type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {DEGREE_TYPES.map((dt) => (
                    <option key={dt} value={dt.toLowerCase()}>{dt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="field" className="text-sm font-medium">
                  Field
                </label>
                <Input id="field" name="field" placeholder="e.g. Computer Science" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="intake_term" className="text-sm font-medium">
                  Intake term
                </label>
                <select id="intake_term" name="intake_term" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option value="fall">Fall</option>
                  <option value="spring">Spring</option>
                  <option value="winter">Winter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="intake_year" className="text-sm font-medium">
                  Intake year
                </label>
                <Input id="intake_year" name="intake_year" type="number" defaultValue={2027} min={2020} max={2035} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="duration_months" className="text-sm font-medium">
                  Duration (months)
                </label>
                <Input id="duration_months" name="duration_months" type="number" min={1} placeholder="e.g. 24" />
              </div>

              <div className="space-y-1">
                <label htmlFor="delivery_mode" className="text-sm font-medium">
                  Delivery mode
                </label>
                <select id="delivery_mode" name="delivery_mode" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option value="on_campus">On campus</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="online">Online</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="program_url" className="text-sm font-medium">
                Program URL
              </label>
              <Input id="program_url" name="program_url" type="url" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label htmlFor="display_priority" className="text-sm font-medium">
                Priority (1-5)
              </label>
              <Input id="display_priority" name="display_priority" type="number" defaultValue={3} min={1} max={5} />
            </div>

            <div className="space-y-1">
              <label htmlFor="research_notes" className="text-sm font-medium">
                Research notes
              </label>
              <textarea
                id="research_notes"
                name="research_notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this program..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create program</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/programs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
