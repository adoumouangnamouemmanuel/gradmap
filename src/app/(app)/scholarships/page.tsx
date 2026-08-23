import Link from "next/link";
import { Plus, Award, DollarSign, Globe, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { ExternalLinkStop } from "@/components/domain/external-link-stop";
import { getScholarships } from "@/features/scholarships/actions";
import { createClient } from "@/lib/supabase/server";

async function getScholarshipsWithPrograms() {
  const scholarships = await getScholarships();
  if (scholarships.length === 0) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return scholarships;

  // Fetch program links for all scholarships
  const { data: links } = await supabase
    .from("program_scholarships")
    .select("scholarship_id, programs!program_scholarships_program_owner_fkey(name)")
    .in("scholarship_id", scholarships.map((s: any) => s.id));

  // Build a map of scholarship_id -> program names
  const programMap: Record<string, string[]> = {};
  for (const link of links || []) {
    if (!programMap[link.scholarship_id]) programMap[link.scholarship_id] = [];
    const programName = (link as any).programs?.name;
    if (programName) programMap[link.scholarship_id].push(programName);
  }

  return scholarships.map((s: any) => ({
    ...s,
    linked_programs: programMap[s.id] || [],
  }));
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarshipsWithPrograms();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Scholarships"
        description="Track funding opportunities and scholarship applications."
        action={
          <Button asChild>
            <Link href="/scholarships/new">
              <Plus className="mr-1 h-4 w-4" />
              Add scholarship
            </Link>
          </Button>
        }
      />

      {scholarships.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title="No scholarships yet"
          description="Start by adding funding opportunities you want to track."
          action={{ label: "Add first scholarship", href: "/scholarships/new" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Scholarship</span>
                  <span>Programs</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {scholarships.map((scholarship: any) => (
                  <Link
                    key={scholarship.id}
                    href={`/scholarships/${scholarship.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{scholarship.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {scholarship.provider && (
                          <>
                            <Globe className="h-3 w-3" />
                            {scholarship.provider}
                          </>
                        )}
                        {scholarship.official_url && (
                          <ExternalLinkStop
                            href={scholarship.official_url}
                            className="text-primary hover:underline"
                          />
                        )}
                      </p>
                    </div>
                    <div className="min-w-0 max-w-[160px]">
                      {scholarship.linked_programs?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {scholarship.linked_programs.map((name: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                              <BookOpen className="h-2.5 w-2.5" />
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">-</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">
                      {scholarship.funding_type}
                    </span>
                    <span className="text-sm font-medium">
                      {scholarship.amount
                        ? `${scholarship.currency_code || ""} ${scholarship.amount.toLocaleString()}`
                        : "-"}
                    </span>
                    <StatusBadge
                      status={
                        scholarship.eligibility_status === "eligible" ? "done" :
                        scholarship.eligibility_status === "likely" ? "preparing" :
                        scholarship.eligibility_status === "ineligible" ? "blocked" :
                        "exploring"
                      }
                      label={scholarship.eligibility_status.replace("_", " ")}
                    />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {scholarships.map((scholarship: any) => (
              <Link key={scholarship.id} href={`/scholarships/${scholarship.id}`}>
                <MobileListItem
                  title={scholarship.name}
                  subtitle={
                    scholarship.linked_programs?.length > 0
                      ? `Programs: ${scholarship.linked_programs.join(", ")}`
                      : `${scholarship.funding_type} · ${scholarship.amount ? `${scholarship.currency_code || ""} ${scholarship.amount.toLocaleString()}` : "Amount TBD"}`
                  }
                  badge={
                    <StatusBadge
                      status={
                        scholarship.eligibility_status === "eligible" ? "done" :
                        scholarship.eligibility_status === "likely" ? "preparing" :
                        scholarship.eligibility_status === "ineligible" ? "blocked" :
                        "exploring"
                      }
                      label={scholarship.eligibility_status.replace("_", " ")}
                    />
                  }
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
