import Link from "next/link";
import { Plus, FileText, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getDocuments } from "@/features/documents/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Your private document vault."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/documents/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Add document</span>
            </Link>
          </Button>
        }
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-7 w-7" />}
          title="No documents yet"
          description="Upload transcripts, diplomas, CVs and other application documents."
          action={{ label: "Add first document", href: "/documents/new" }}
        />
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/30 bg-muted/15 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    <span>Document</span>
                    <span>Type</span>
                    <span>Version</span>
                  </div>
                  {documents.map((doc: any) => (
                    <Link key={doc.id} href={`/documents/${doc.id}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors">                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{doc.name}</p>
                      </div>
                      <span className="text-[13px] text-muted-foreground capitalize">{doc.document_type.replace(/_/g, " ")}</span>
                      {doc.current_version_id ? (
                        <span className="text-emerald-500 text-[14px] font-medium">✓</span>
                      ) : (
                        <span className="text-muted-foreground/30 text-[14px]">—</span>
                      )}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.1}>
              <GroupedList>
                {documents.map((doc: any, i: number) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <MobileListItem
                      index={i}
                      title={doc.name}
                      subtitle={doc.document_type.replace(/_/g, " ")}
                      indicator={
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-primary/[0.08] text-primary/60">
                          <FileText className="h-[16px] w-[16px]" />
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
