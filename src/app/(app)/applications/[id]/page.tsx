import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, Clock } from "lucide-react";
import { getApplication } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { DeadlineIndicator } from "@/components/domain/deadline-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let application;
  try {
    application = await getApplication(id);
  } catch {
    notFound();
  }

  const program = application.programs;
  const inst = program?.institutions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Applications
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {program?.name}
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
            </p>
          </div>
          <StatusBadge
            status={
              application.status === "submitted" ? "submitted" :
              application.status === "admitted" ? "done" :
              application.status === "rejected" ? "blocked" :
              application.status === "preparing" || application.status === "ready" ? "preparing" :
              "exploring"
            }
            label={application.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="text-sm font-medium mt-1 capitalize">{application.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
                <p className="text-sm font-medium mt-1">{application.priority}/5</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Round</p>
                <p className="text-sm font-medium mt-1">{application.application_round || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee Status</p>
                <p className="text-sm font-medium mt-1 capitalize">{application.fee_status}</p>
              </div>
              {application.submitted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-medium mt-1">{new Date(application.submitted_at).toLocaleDateString()}</p>
                </div>
              )}
              {application.response_due_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response Due</p>
                  <DeadlineIndicator dueAt={application.response_due_at} />
                </div>
              )}
            </CardContent>
          </Card>

          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/programs/${application.program_id}`}>View program</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/calendar?application=${application.id}`}>View deadlines</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
