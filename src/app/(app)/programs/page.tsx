import Link from "next/link";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getPrograms } from "@/features/programs/actions";

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Programs"
        description="Track graduate programs across institutions."
        action={
          <Button asChild>
            <Link href="/programs/new">
              <Plus className="mr-1 h-4 w-4" />
              Add program
            </Link>
          </Button>
        }
      />

      {programs.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No programs yet"
          description="Start by adding an institution, then create programs to track."
          action={{ label: "Add first program", onClick: () => {}, href: "/programs/new" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Program</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Deadline</span>
                </div>
                {programs.map((program: any) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
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
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {programs.map((program: any) => (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <MobileListItem
                  title={program.name}
                  subtitle={`${program.institutions?.name} · ${program.institutions?.country_name || ""}`}
                  badge={
                    <StatusBadge status={program.status === "exploring" ? "exploring" : program.status === "shortlisted" ? "preparing" : program.status === "applying" ? "preparing" : "submitted"} />
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
