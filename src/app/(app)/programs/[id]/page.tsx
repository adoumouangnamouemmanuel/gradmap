import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, ExternalLink, Clock } from "lucide-react";
import { getProgram, getProgramEvaluation } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Metric } from "@/components/domain/metric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

  // Compute normalized score if evaluation exists
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
      {/* Back link */}
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
              {inst?.name}
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
          <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} label={program.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm font-medium mt-1">{program.delivery_mode || "Not specified"}</p>
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
                <Link href={`/applications?program=${program.id}`}>View application</Link>
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
