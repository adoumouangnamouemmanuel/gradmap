import Link from "next/link";
import { Plus, Building2, Globe } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getPrograms } from "@/features/programs/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ProgramFilters } from "./program-filters";

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { institution, degree, status } = await searchParams;
  let programs = await getPrograms();
  const instMap = new Map(); const degreeSet = new Set<string>(); const statusSet = new Set<string>();
  programs.forEach((p: any) => {
    if (p.institutions) instMap.set(p.institution_id, p.institutions.name);
    if (p.degree_type) degreeSet.add(p.degree_type);
    if (p.status) statusSet.add(p.status);
  });
  const uniqueInstitutions = Array.from(instMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  if (institution && typeof institution === "string") programs = programs.filter((p: any) => p.institution_id === institution);
  if (degree && typeof degree === "string") programs = programs.filter((p: any) => p.degree_type === degree);
  if (status && typeof status === "string") programs = programs.filter((p: any) => p.status === status);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <PageHeader title="Programs" description="Track graduate programs across institutions."
          action={<Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4"><Link href="/programs/new"><Plus className="h-5 w-5 sm:mr-1" /><span className="hidden sm:inline">Add program</span></Link></Button>}
        >
          <div className="mt-2"><ProgramFilters institutions={uniqueInstitutions} degreeTypes={Array.from(degreeSet).sort()} statuses={Array.from(statusSet).sort()} /></div>
        </PageHeader>
      </FadeIn>

      {programs.length === 0 ? (
        <FadeIn delay={0.2}>
          <EmptyState icon={<Building2 className="h-7 w-7" />} title="No programs yet" description="Start by adding an institution, then create programs to track." action={{ label: "Add first program", href: "/programs/new" }} />
        </FadeIn>
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.15}>
              <Card>
                <CardContent className="p-0">
                  {programs.map((program: any) => (
                    <Link key={program.id} href={`/programs/${program.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{program.name}</p>
                        <p className="text-[13px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" /> {program.institutions?.name}
                          {program.institutions?.country_name && <><span>·</span><Globe className="h-3 w-3 shrink-0" /> {program.institutions.country_name}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "applying" ? "preparing" : "submitted"} />
                        <span className="text-[13px] text-muted-foreground">{program.intake_year}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.15}>
              <GroupedList>
                {programs.map((program: any, i: number) => (
                  <Link key={program.id} href={`/programs/${program.id}`}>
                    <MobileListItem index={i} title={program.name} subtitle={`${program.institutions?.name || ""} · ${program.institutions?.country_name || ""}`}
                      badge={<StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "applying" ? "preparing" : "submitted"} />}
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
