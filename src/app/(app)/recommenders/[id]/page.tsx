import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Plus, Trash2 } from "lucide-react";
import { getRecommender, archiveRecommender } from "@/features/essays/actions";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/types/database";

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

  const requests: Tables<"recommendation_requests">[] = (recommender.recommendation_requests || [])
    .sort((a: Tables<"recommendation_requests">, b: Tables<"recommendation_requests">) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="workspace-page">
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
                  {requests.map((req) => (
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
                        {req.application_id && <Link className="mt-2 block text-xs text-primary" href={`/applications/${req.application_id}#people`}>View application →</Link>}
                        <Link className="mt-2 block text-xs text-primary" href={`/calendar/new?kind=task&request=${req.id}`}>Plan a follow-up →</Link>
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
                <Button asChild size="sm"><Link href={`/recommenders/new?mode=request&recommender=${id}`}><Plus size={15} />Track an application request</Link></Button><p className="mt-3 text-xs text-muted-foreground">Choose an application and due date in the connected form. No message is sent.</p>
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
              <div className="pt-3 border-t">
                <form action={async () => { "use server"; await archiveRecommender(id); }}>
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Archive recommender
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
