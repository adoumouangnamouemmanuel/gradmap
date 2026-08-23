import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StopPropagationAnchor } from "@/components/domain/stop-prop-anchor";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getInstitutions } from "@/features/programs/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { InstitutionFilter } from "./institution-filter";

export default async function InstitutionsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { country } = await searchParams;
  let institutions = await getInstitutions();
  institutions.sort((a: any, b: any) => a.name.localeCompare(b.name));
  const countries = Array.from(new Set(institutions.map((i: any) => i.country_name).filter(Boolean))).sort() as string[];
  if (country && typeof country === "string") institutions = institutions.filter((i: any) => i.country_name === country);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <PageHeader title="Institutions" description="Universities and schools you are applying to."
          action={
            <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
              <Link href="/institutions/new"><Plus className="h-5 w-5 sm:mr-1" /><span className="hidden sm:inline">Add institution</span></Link>
            </Button>
          }
        >
          {countries.length > 0 && <div className="mt-2"><InstitutionFilter countries={countries} /></div>}
        </PageHeader>
      </FadeIn>

      {institutions.length === 0 ? (
        <FadeIn delay={0.2}>
          <EmptyState icon={<Building2 className="h-7 w-7" />} title="No institutions yet" description="Start by adding the universities you are interested in." action={{ label: "Add first institution", href: "/institutions/new" }} />
        </FadeIn>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden md:block">
            <FadeIn delay={0.15}>
              <Card>
                <CardContent className="p-0">
                  {institutions.map((inst: any) => (
                    <Link key={inst.id} href={`/institutions/${inst.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{inst.name}</p>
                        {inst.website_url && (
                          <StopPropagationAnchor href={inst.website_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary/70 hover:underline">
                            Website
                          </StopPropagationAnchor>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-muted-foreground shrink-0">
                        <span>{inst.country_name || "—"}</span>
                        <span>·</span>
                        <span>{inst.city || "—"}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Mobile grouped list */}
          <div className="mt-4 md:hidden">
            <FadeIn delay={0.15}>
              <GroupedList>
                {institutions.map((inst: any, i: number) => (
                  <Link key={inst.id} href={`/institutions/${inst.id}`}>
                    <MobileListItem
                      index={i}
                      title={inst.name}
                      subtitle={[inst.country_name, inst.city].filter(Boolean).join(" · ")}
                      indicator={
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-primary/[0.08] text-primary/60">
                          <Building2 className="h-[16px] w-[16px]" />
                        </div>
                      }
                    />
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
