import Link from "next/link";
import { Plus, Users, Mail } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StopPropagationAnchor } from "@/components/domain/stop-prop-anchor";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getRecommenders } from "@/features/essays/actions";

export default async function RecommendersPage() {
  const recommenders = await getRecommenders();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Recommenders"
        description="Manage recommendation letter writers and track request status."
        action={
          <Button asChild>
            <Link href="/recommenders/new">
              <Plus className="mr-1 h-4 w-4" />
              Add recommender
            </Link>
          </Button>
        }
      />

      {recommenders.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No recommenders yet"
          description="Add professors or supervisors who will write recommendation letters."
          action={{ label: "Add first recommender", href: "/recommenders/new" }}
        />
      ) : (
        <>
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Name</span>
                  <span>Institution</span>
                  <span>Contact</span>
                </div>
                {recommenders.map((rec: any) => (
                  <Link
                    key={rec.id}
                    href={`/recommenders/${rec.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{rec.name}</p>
                      {rec.title && (
                        <p className="text-xs text-muted-foreground">{rec.title}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rec.institution || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {rec.email ? (
                        <StopPropagationAnchor href={`mailto:${rec.email}`} className="text-primary hover:underline">
                          <Mail className="h-4 w-4" />
                        </StopPropagationAnchor>
                      ) : "-"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {recommenders.map((rec: any) => (
              <Link key={rec.id} href={`/recommenders/${rec.id}`}>
                <MobileListItem
                  title={rec.name}
                  subtitle={rec.institution || rec.email || "No details"}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
