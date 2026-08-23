import Link from "next/link";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StopPropagationAnchor } from "@/components/domain/stop-prop-anchor";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getInstitutions } from "@/features/programs/actions";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { InstitutionFilter } from "./institution-filter";

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { country } = await searchParams;
  let institutions = await getInstitutions();

  // Sort alphabetically by name
  institutions.sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Extract unique countries
  const countries = Array.from(new Set(institutions.map((i: any) => i.country_name).filter(Boolean))).sort() as string[];

  // Filter by country
  if (country && typeof country === 'string') {
    institutions = institutions.filter((i: any) => i.country_name === country);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <PageHeader
          title="Institutions"
          description="Universities and schools you are applying to."
          action={
            <Button asChild size="icon" className="shadow-sm shadow-primary/20 shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-4">
              <Link href="/institutions/new">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add institution</span>
              </Link>
            </Button>
          }
        >
          {countries.length > 0 && (
            <div className="mt-2">
              <InstitutionFilter countries={countries} />
            </div>
          )}
        </PageHeader>
      </FadeIn>

      {institutions.length === 0 ? (
        <FadeIn delay={0.2}>
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No institutions yet"
            description="Start by adding the universities you are interested in."
            action={{ label: "Add first institution", href: "/institutions/new" }}
          />
        </FadeIn>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden md:block">
            <FadeIn delay={0.2}>
              <Card className="shadow-sm border-border/50 bg-background/50 backdrop-blur overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/60 bg-muted/20 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Institution</span>
                  <span>Country</span>
                  <span>City</span>
                </div>
                {institutions.map((inst: any) => (
                  <Link
                    key={inst.id}
                    href={`/institutions/${inst.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/50 px-6 py-4 last:border-b-0 hover:bg-muted/40 transition-all duration-200 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inst.name}</p>
                      {inst.website_url && (
                        <StopPropagationAnchor
                          href={inst.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </StopPropagationAnchor>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {inst.country_name || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {inst.city || "-"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

          {/* Mobile list */}
          <StaggerContainer className="mt-6 space-y-3 md:hidden">
            {institutions.map((inst: any) => (
              <StaggerItem key={inst.id}>
                <Link href={`/institutions/${inst.id}`} className="block transition-transform duration-200 active:scale-[0.98]">
                  <MobileListItem
                    title={inst.name}
                    subtitle={`${inst.country_name || ""} ${inst.city ? `· ${inst.city}` : ""}`}
                  />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </>
      )}
    </div>
  );
}
