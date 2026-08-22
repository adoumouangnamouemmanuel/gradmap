import Link from "next/link";
import { Plus, FileText, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getDocuments } from "@/features/documents/actions";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Your private document vault."
        action={
          <Button asChild>
            <Link href="/documents/new">
              <Plus className="mr-1 h-4 w-4" />
              Add document
            </Link>
          </Button>
        }
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title="No documents yet"
          description="Upload transcripts, diplomas, CVs and other application documents."
          action={{ label: "Add first document", href: "/documents/new" }}
        />
      ) : (
        <>
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Document</span>
                  <span>Type</span>
                  <span>Versions</span>
                </div>
                {documents.map((doc: any) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {doc.current_version_id ? "✓" : "—"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {documents.map((doc: any) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <MobileListItem
                  title={doc.name}
                  subtitle={doc.document_type.replace(/_/g, " ")}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
