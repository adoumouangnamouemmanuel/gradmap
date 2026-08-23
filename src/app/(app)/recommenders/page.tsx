import Link from "next/link";
import { Plus, Users, Mail } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StopPropagationAnchor } from "@/components/domain/stop-prop-anchor";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getRecommenders } from "@/features/essays/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default async function RecommendersPage() {
  const recommenders = await getRecommenders();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Recommenders"
        description="Manage recommendation letter writers and track request status."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/recommenders/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Add recommender</span>
            </Link>
          </Button>
        }
      />

      {recommenders.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title="No recommenders yet" description="Add professors or supervisors who will write recommendation letters." action={{ label: "Add first recommender", href: "/recommenders/new" }} />
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/30 bg-muted/15 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    <span>Name</span>
                    <span>Institution</span>
                    <span>Contact</span>
                  </div>
                  {recommenders.map((rec: any) => (
                    <Link key={rec.id} href={`/recommenders/${rec.id}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors">                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{rec.name}</p>
                        {rec.title && <p className="text-[13px] text-muted-foreground">{rec.title}</p>}
                      </div>
                      <span className="text-[13px] text-muted-foreground">{rec.institution || "—"}</span>
                      <span>
                        {rec.email ? (
                          <StopPropagationAnchor href={`mailto:${rec.email}`} className="text-primary/60 hover:text-primary">
                            <Mail className="h-[16px] w-[16px]" />
                          </StopPropagationAnchor>
                        ) : "—"}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.1}>
              <GroupedList>
                {recommenders.map((rec: any, i: number) => (
                  <Link key={rec.id} href={`/recommenders/${rec.id}`}>
                    <MobileListItem index={i} title={rec.name} subtitle={rec.institution || rec.email || "No details"} />
                  </Link>
                ))}
              </GroupedList>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
