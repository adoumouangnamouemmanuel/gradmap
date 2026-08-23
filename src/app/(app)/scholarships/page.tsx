import Link from "next/link";
import { Plus, Award, Globe } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getScholarships } from "@/features/scholarships/actions";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ScholarshipFilters } from "./scholarship-filters";

async function getScholarshipsWithPrograms() {
  const scholarships = await getScholarships();
  if (scholarships.length === 0) return [];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return scholarships;
  const { data: links } = await supabase
    .from("program_scholarships")
    .select("scholarship_id, programs!program_scholarships_program_owner_fkey(name)")
    .in("scholarship_id", scholarships.map((s: any) => s.id));
  const programMap: Record<string, string[]> = {};
  for (const link of links || []) {
    if (!programMap[link.scholarship_id]) programMap[link.scholarship_id] = [];
    const name = (link as any).programs?.name;
    if (name) programMap[link.scholarship_id].push(name);
  }
  return scholarships.map((s: any) => ({ ...s, linked_programs: programMap[s.id] || [] }));
}

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { fundingType, status } = await searchParams;
  let scholarships = await getScholarshipsWithPrograms();
  const fundingSet = new Set<string>(); const statusSet = new Set<string>();
  scholarships.forEach((s: any) => { if (s.funding_type) fundingSet.add(s.funding_type); if (s.eligibility_status) statusSet.add(s.eligibility_status); });
  if (fundingType && typeof fundingType === "string") scholarships = scholarships.filter((s: any) => s.funding_type === fundingType);
  if (status && typeof status === "string") scholarships = scholarships.filter((s: any) => s.eligibility_status === status);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <PageHeader title="Scholarships" description="Track funding opportunities and scholarship applications."
          action={<Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4"><Link href="/scholarships/new"><Plus className="h-5 w-5 sm:mr-1" /><span className="hidden sm:inline">Add scholarship</span></Link></Button>}
        >
          <div className="mt-2"><ScholarshipFilters fundingTypes={Array.from(fundingSet).sort()} statuses={Array.from(statusSet).sort()} /></div>
        </PageHeader>
      </FadeIn>

      {scholarships.length === 0 ? (
        <FadeIn delay={0.2}>
          <EmptyState icon={<Award className="h-7 w-7" />} title="No scholarships found" description="Start by adding funding opportunities you want to track." action={{ label: "Add first scholarship", href: "/scholarships/new" }} />
        </FadeIn>
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.15}>
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border/30 bg-muted/15 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    <span>Scholarship</span>
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  {scholarships.map((s: any) => (
                    <Link key={s.id} href={`/scholarships/${s.id}`}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors">                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{s.name}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {s.provider || "—"}
                        </p>
                      </div>
                      <span className="text-[13px] text-muted-foreground capitalize">{s.funding_type}</span>
                      <span className="text-[13px] font-medium tabular-nums">
                        {s.amount ? `${s.currency_code || ""} ${s.amount.toLocaleString()}` : "—"}
                      </span>
                      <StatusBadge status={s.eligibility_status === "eligible" ? "done" : s.eligibility_status === "likely" ? "preparing" : "exploring"} label={s.eligibility_status?.replace("_", " ")} />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.15}>
              <GroupedList>
                {scholarships.map((s: any, i: number) => (
                  <Link key={s.id} href={`/scholarships/${s.id}`}>
                    <MobileListItem index={i} title={s.name}
                      subtitle={s.linked_programs?.length > 0 ? s.linked_programs.join(", ") : `${s.funding_type} · ${s.amount ? `${s.currency_code || ""} ${s.amount.toLocaleString()}` : "TBD"}`}
                      badge={<StatusBadge status={s.eligibility_status === "eligible" ? "done" : s.eligibility_status === "likely" ? "preparing" : "exploring"} label={s.eligibility_status?.replace("_", " ")} />}
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
