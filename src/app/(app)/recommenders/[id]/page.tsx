import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Plus } from "lucide-react";
import { getRecommender, createRecommendationRequest, updateRecommendationRequestStatus } from "@/features/essays/actions";
import { getApplications } from "@/features/programs/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function RecommenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let recommender;
  try {
    recommender = await getRecommender(id);
  } catch {
    notFound();
  }

  let applications: any[] = [];
  try {
    applications = await getApplications();
  } catch {
    // No applications
  }

  const requests = (recommender.recommendation_requests || [])
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/recommenders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Recommenders
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {recommender.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {recommender.title && `${recommender.title} · `}
          {recommender.institution || ""}
          {recommender.relationship && ` · ${recommender.relationship}`}
        </p>
        {recommender.email && (
          <a href={`mailto:${recommender.email}`} className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
            <Mail className="h-4 w-4" />
            {recommender.email}
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Recommendation Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {requests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">
                          {req.application_id ? `Application request` : `General request`}
                        </p>
                        {req.due_at && (
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(req.due_at).toLocaleDateString()}
                          </p>
                        )}
                        {req.notes && (
                          <p className="text-xs text-muted-foreground">{req.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={
                            req.status === "submitted" ? "done" :
                            req.status === "accepted" ? "preparing" :
                            req.status === "declined" ? "blocked" :
                            "draft"
                          }
                          label={req.status}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 mb-4">
                  No requests yet.
                </p>
              )}

              {/* New request form */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  New request
                </p>
                <form action={async (formData: FormData) => {
                  "use server";
                  await createRecommendationRequest({
                    recommender_id: id,
                    application_id: formData.get("application_id") as string || undefined,
                    due_at: formData.get("due_at") as string || undefined,
                    notes: formData.get("notes") as string || undefined,
                  });
                }} className="space-y-3">
                  <select name="application_id" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">General request (no specific application)</option>
                    {applications.map((app: any) => (
                      <option key={app.id} value={app.id}>
                        {app.programs?.name} - {app.status}
                      </option>
                    ))}
                  </select>
                  <Input name="due_at" type="datetime-local" />
                  <Input name="notes" placeholder="Notes (optional)" />
                  <Button type="submit" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Create request
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommender.relationship && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Relationship</p>
                  <p className="text-sm font-medium mt-1">{recommender.relationship}</p>
                </div>
              )}
              {recommender.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{recommender.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
