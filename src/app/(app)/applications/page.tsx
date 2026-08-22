import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { Separator } from "@/components/ui/separator";
import { getApplications } from "@/features/programs/actions";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Applications"
        description="Track your program applications and their status."
        action={
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="mr-1 h-4 w-4" />
              New application
            </Link>
          </Button>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No applications yet"
          description="Create an application from a program page to start tracking."
          action={{ label: "Browse programs", onClick: () => {}, href: "/programs" }}
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
                  <span>Round</span>
                </div>
                {applications.map((app: any) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{app.programs?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.programs?.institutions?.name} · {app.programs?.institutions?.country_name}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        app.status === "submitted" ? "submitted" :
                        app.status === "admitted" ? "done" :
                        app.status === "rejected" ? "blocked" :
                        app.status === "preparing" || app.status === "ready" ? "preparing" :
                        "exploring"
                      }
                      label={app.status}
                    />
                    <span className="text-sm font-medium">{app.priority}/5</span>
                    <span className="text-xs text-muted-foreground">{app.application_round || "—"}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="mt-6 space-y-3 sm:hidden">
            {applications.map((app: any) => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <MobileListItem
                  title={app.programs?.name || "Application"}
                  subtitle={`${app.programs?.institutions?.name} · ${app.programs?.institutions?.country_name || ""}`}
                  badge={
                    <StatusBadge
                      status={
                        app.status === "submitted" ? "submitted" :
                        app.status === "admitted" ? "done" :
                        app.status === "rejected" ? "blocked" :
                        app.status === "preparing" || app.status === "ready" ? "preparing" :
                        "exploring"
                      }
                      label={app.status}
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
