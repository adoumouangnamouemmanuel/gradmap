import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createInstitutionFromForm } from "@/features/programs/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInstitutionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/institutions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Institutions
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add an institution</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInstitutionFromForm} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Institution name *
              </label>
              <Input id="name" name="name" required placeholder="e.g. University of Lille" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="country_name" className="text-sm font-medium">
                  Country
                </label>
                <select
                  id="country_name"
                  name="country_name"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select country</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="Erasmus Mundus (Multi-country)">Erasmus Mundus (Multi-country)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>
                <Input id="city" name="city" placeholder="e.g. Lille" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="website_url" className="text-sm font-medium">
                Website URL
              </label>
              <Input id="website_url" name="website_url" type="url" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this institution..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create institution</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/institutions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
