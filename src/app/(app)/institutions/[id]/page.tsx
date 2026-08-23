import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, ExternalLink, Pencil, Trash2, FileText, Award, Users, GraduationCap } from "lucide-react";
import { getInstitution, getPrograms, getApplications, archiveInstitution } from "@/features/programs/actions";
import { getScholarships } from "@/features/scholarships/actions";
import { getContacts } from "@/features/essays/actions";
import { StatusBadge } from "@/components/domain/status-badge";
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

  // Fetch related entities
  let programs: any[] = [];
  let applications: any[] = [];
  let scholarships: any[] = [];
  let contacts: any[] = [];

  try {
    const allPrograms = await getPrograms();
    programs = allPrograms.filter((p: any) => p.institution_id === id);
  } catch {}

  try {
    const allApps = await getApplications();
    const programIds = programs.map((p: any) => p.id);
    applications = allApps.filter((a: any) => programIds.includes(a.program_id));
  } catch {}

  try {
    const allScholarships = await getScholarships();
    scholarships = allScholarships.filter((s: any) => s.provider === institution.name);
  } catch {}

  try {
    const allContacts = await getContacts();
    contacts = allContacts.filter((c: any) => c.institution === institution.name);
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/institutions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Institutions
      </Link>

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
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
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

          {/* Programs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Programs ({programs.length})
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/programs/new?institution=${id}`}>
                    + Add
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No programs yet.{" "}
                  <Link href={`/programs/new?institution=${id}`} className="text-primary hover:underline">Add one</Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {programs.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/programs/${p.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.degree_type || "Program"}{p.field ? ` · ${p.field}` : ""}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          p.status === "exploring" ? "exploring" :
                          p.status === "applying" ? "preparing" :
                          "submitted"
                        }
                        label={p.status}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          {applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {applications.map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{app.programs?.name || "Application"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{app.status?.replace(/_/g, " ")}</p>
                      </div>
                      <StatusBadge
                        status={
                          app.status === "submitted" ? "submitted" :
                          app.status === "admitted" ? "done" :
                          app.status === "rejected" ? "blocked" :
                          "exploring"
                        }
                        label={app.status}
                      />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scholarships */}
          {scholarships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Scholarships ({scholarships.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scholarships.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/scholarships/${s.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.funding_type?.replace(/_/g, " ")}</p>
                      </div>
                      <StatusBadge
                        status={
                          s.eligibility_status === "eligible" ? "done" :
                          s.eligibility_status === "likely" ? "preparing" :
                          "exploring"
                        }
                        label={s.eligibility_status}
                      />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contacts */}
          {contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Contacts ({contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contacts.map((c: any) => (
                    <Link
                      key={c.id}
                      href={`/contacts/${c.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.role || c.email || "Contact"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
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
                <Link href={`/programs/new?institution=${institution.id}`}>Add program</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/contacts/new?institution=${encodeURIComponent(institution.name)}`}>Add contact</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/institutions/${institution.id}/edit?name=${encodeURIComponent(institution.name || "")}&country_name=${encodeURIComponent(institution.country_name || "")}&city=${encodeURIComponent(institution.city || "")}&website_url=${encodeURIComponent(institution.website_url || "")}&notes=${encodeURIComponent(institution.notes || "")}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit institution
                </Link>
              </Button>
              <form action={async () => {
                "use server";
                await archiveInstitution(institution.id);
              }}>
                <Button type="submit" className="w-full" variant="ghost" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Archive institution
                </Button>
              </form>
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
