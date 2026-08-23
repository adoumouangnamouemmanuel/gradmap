import Link from "next/link";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getPrograms } from "@/features/programs/actions";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { ProgramFilters } from "./program-filters";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { institution, degree, status } = await searchParams;
  let programs = await getPrograms();

  const instMap = new Map();
  const degreeSet = new Set<string>();
  const statusSet = new Set<string>();

  programs.forEach((p: any) => {
    if (p.institutions) {
      instMap.set(p.institution_id, p.institutions.name);
    }
    if (p.degree_type) degreeSet.add(p.degree_type);
    if (p.status) statusSet.add(p.status);
  });

  const uniqueInstitutions = Array.from(instMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  const uniqueDegrees = Array.from(degreeSet).sort();
  const uniqueStatuses = Array.from(statusSet).sort();

  if (institution && typeof institution === 'string') {
    programs = programs.filter((p: any) => p.institution_id === institution);
  }
  if (degree && typeof degree === 'string') {
    programs = programs.filter((p: any) => p.degree_type === degree);
  }
  if (status && typeof status === 'string') {
    programs = programs.filter((p: any) => p.status === status);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <PageHeader
          title="Programs"
          description="Track graduate programs across institutions."
          action={
            <Button asChild size="icon" className="shadow-sm shadow-primary/20 shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-4">
              <Link href="/programs/new">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add program</span>
              </Link>
            </Button>
          }
        >
          <div className="mt-2">
            <ProgramFilters 
              institutions={uniqueInstitutions} 
              degreeTypes={uniqueDegrees} 
              statuses={uniqueStatuses} 
            />
          </div>
        </PageHeader>
      </FadeIn>

      {programs.length === 0 ? (
        <FadeIn delay={0.2}>
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No programs yet"
            description="Start by adding an institution, then create programs to track."
            action={{ label: "Add first program", href: "/programs/new" }}
          />
        </FadeIn>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <FadeIn delay={0.2}>
              <Card className="shadow-sm border-border/50 bg-background/50 backdrop-blur overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border/60 bg-muted/20 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Program</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Deadline</span>
                </div>
                {programs.map((program: any) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border/50 px-6 py-4 last:border-b-0 hover:bg-muted/40 transition-all duration-200 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{program.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {program.institutions?.name}
                        {program.institutions?.country_name && (
                          <span className="flex items-center gap-0.5">
                            <span>·</span>
                            <Globe className="h-3 w-3" />
                            {program.institutions.country_name}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} />
                    <span className="text-sm font-medium">{program.display_priority}/5</span>
                    <span className="text-xs text-muted-foreground">{program.intake_year}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

          {/* Mobile list */}
          <StaggerContainer className="mt-6 space-y-3 sm:hidden">
            {programs.map((program: any) => (
              <StaggerItem key={program.id}>
                <Link href={`/programs/${program.id}`} className="block transition-transform duration-200 active:scale-[0.98]">
                  <MobileListItem
                    title={program.name}
                    subtitle={`${program.institutions?.name} · ${program.institutions?.country_name || ""}`}
                    badge={
                      <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} />
                    }
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
