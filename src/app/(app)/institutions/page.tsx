import Link from "next/link";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getInstitutions } from "@/features/programs/actions";

export default async function InstitutionsPage() {
  const institutions = await getInstitutions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Institutions"
        description="Universities and schools you are applying to."
        action={
          <Button asChild>
            <Link href="/institutions/new">
              <Plus className="mr-1 h-4 w-4" />
              Add institution
            </Link>
          </Button>
        }
      />

      {institutions.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No institutions yet"
          description="Start by adding the universities you are interested in."
          action={{ label: "Add first institution", href: "/institutions/new" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Institution</span>
                  <span>Country</span>
                  <span>City</span>
                </div>
                {institutions.map((inst: any) => (
                  <Link
                    key={inst.id}
                    href={`/institutions/${inst.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inst.name}</p>
                      {inst.website_url && (
                        <a
                          href={inst.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {inst.country_name || "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {inst.city || "—"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {institutions.map((inst: any) => (
              <Link key={inst.id} href={`/institutions/${inst.id}`}>
                <MobileListItem
                  title={inst.name}
                  subtitle={`${inst.country_name || ""} ${inst.city ? `· ${inst.city}` : ""}`}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
