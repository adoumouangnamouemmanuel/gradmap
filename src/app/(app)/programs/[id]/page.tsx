import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Building2, Globe, ExternalLink, Clock,
  FileText, Award, Calendar, CheckCircle2, Plus, DollarSign,
} from "lucide-react";
import { getProgram, getProgramEvaluation, getApplications } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getScholarships } from "@/features/scholarships/actions";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let program;
  try {
    program = await getProgram(id);
  } catch {
    notFound();
  }

  let evaluation = null;
  try {
    evaluation = await getProgramEvaluation(id);
  } catch {
    // No evaluation yet
  }

  // Fetch linked entities
  let applications: any[] = [];
  let linkedScholarships: any[] = [];
  try {
    const allApps = await getApplications();
    applications = allApps.filter((a: any) => a.program_id === id);
  } catch {}

  try {
    const allScholarships = await getScholarships();
    // Scholarships linked via program_scholarships
    linkedScholarships = allScholarships; // simplified - actual linking via junction table
  } catch {}

  // Compute normalized score
  let normalizedScore: number | null = null;
  if (evaluation) {
    const scores = [
      { value: evaluation.academic_fit, weight: evaluation.academic_weight },
      { value: evaluation.research_career_fit, weight: evaluation.research_weight },
      { value: evaluation.funding_strength, weight: evaluation.funding_weight },
      { value: evaluation.admission_feasibility, weight: evaluation.feasibility_weight },
      { value: evaluation.location_personal_fit, weight: evaluation.location_weight },
    ];
    const totalWeight = scores.reduce((sum, s) => sum + (s.weight || 0), 0);
    const scored = scores.filter((s) => s.value != null);
    if (scored.length === scores.length && totalWeight > 0) {
      normalizedScore = scored.reduce((sum, s) => sum + (s.value! / 5) * s.weight!, 0);
      normalizedScore = Math.round(normalizedScore * 10) / 10;
    }
  }

  const inst = program.institutions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/programs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Programs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {program.name}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <Link href={`/institutions/${inst?.id}`} className="hover:text-foreground hover:underline">
                {inst?.name}
              </Link>
              {inst?.country_name && (
                <>
                  <span>·</span>
                  <Globe className="h-4 w-4" />
                  {inst.country_name}
                </>
              )}
              {inst?.city && <span>({inst.city})</span>}
            </p>
          </div>
          <StatusBadge
            status={
              program.status === "exploring" ? "exploring" :
              program.status === "shortlisted" ? "preparing" :
              program.status === "applying" ? "preparing" :
              "submitted"
            }
            label={program.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Program Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Degree Type</p>
                <p className="text-sm font-medium mt-1">{program.degree_type || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Field</p>
                <p className="text-sm font-medium mt-1">{program.field || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intake</p>
                <p className="text-sm font-medium mt-1">{program.intake_term || "—"} {program.intake_year}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</p>
                <p className="text-sm font-medium mt-1">{program.duration_months ? `${program.duration_months} months` : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Mode</p>
                <p className="text-sm font-medium mt-1 capitalize">{program.delivery_mode?.replace(/_/g, " ") || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
                <p className="text-sm font-medium mt-1">{program.display_priority}/5</p>
              </div>
            </CardContent>
          </Card>

          {program.program_url && (
            <Card>
              <CardContent className="p-4">
                <a
                  href={program.program_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View official program page
                </a>
              </CardContent>
            </Card>
          )}

          {program.research_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Research Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{program.research_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Applications for this program */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Applications ({applications.length})
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/applications/new?program=${id}`}>
                    <Plus className="mr-1 h-3 w-3" />
                    New
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No applications yet.{" "}
                  <Link href={`/applications/new?program=${id}`} className="text-primary hover:underline">
                    Create one
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {applications.map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">Application {app.application_round || ""}</p>
                        <p className="text-xs text-muted-foreground">
                          Priority {app.priority}/5
                          {app.submitted_at && ` · Submitted ${new Date(app.submitted_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          app.status === "submitted" ? "submitted" :
                          app.status === "admitted" ? "done" :
                          app.status === "rejected" ? "blocked" :
                          app.status === "preparing" || app.status === "ready" ? "preparing" :
                          "exploring"
                        }
                        label={app.status}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evaluation score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              {normalizedScore !== null ? (
                <div className="text-center">
                  <p className="font-serif text-4xl font-bold text-primary">{normalizedScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evaluation yet
                </p>
              )}
              <Separator className="my-4" />
              <div className="space-y-2">
                {[
                  { label: "Academic Fit", value: evaluation?.academic_fit },
                  { label: "Research/Career", value: evaluation?.research_career_fit },
                  { label: "Funding Strength", value: evaluation?.funding_strength },
                  { label: "Admission Feasibility", value: evaluation?.admission_feasibility },
                  { label: "Location/Personal", value: evaluation?.location_personal_fit },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value != null ? `${item.value}/5` : "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/applications/new?program=${id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create application
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/scholarships/new?program=${id}`}>
                  <Award className="mr-2 h-4 w-4" />
                  Link scholarship
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/calendar?program=${id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Add deadline
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/programs/${program.id}/edit`}>Edit program</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
