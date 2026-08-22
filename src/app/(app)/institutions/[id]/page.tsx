import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, ExternalLink } from "lucide-react";
import { getInstitution } from "@/features/programs/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let institution;
  try {
    institution = await getInstitution(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/institutions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Institutions
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {institution.name}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              {institution.country_name && (
                <>
                  <Globe className="h-4 w-4" />
                  {institution.country_name}
                </>
              )}
              {institution.city && (
                <>
                  <span>·</span>
                  <MapPin className="h-4 w-4" />
                  {institution.city}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</p>
                <p className="text-sm font-medium mt-1">{institution.country_name || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</p>
                <p className="text-sm font-medium mt-1">{institution.city || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {institution.website_url && (
            <Card>
              <CardContent className="p-4">
                <a
                  href={institution.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit official website
                </a>
              </CardContent>
            </Card>
          )}

          {institution.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{institution.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/programs/new?institution=${institution.id}`}>Add program at this institution</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/institutions">Back to institutions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
