import Link from "next/link";
import { ArrowLeft, FileText, Clock, CheckCircle2, Download, AlertCircle } from "lucide-react";
import { getDocument } from "@/features/documents/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/domain/document-upload";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let document;
  try {
    document = await getDocument(id);
  } catch (err: any) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/documents"
          className="mb-4 inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground press-apple"
        >
          <ArrowLeft className="h-4 w-4" />
          Documents
        </Link>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-apple-scale">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-lg font-semibold">Document not found</h3>
            <p className="mt-1.5 max-w-[280px] text-[14px] text-muted-foreground leading-relaxed">
              This document may not exist, or you may not have access to it.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href="/documents">Back to documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const versions = (document.document_versions || [])
    .sort((a: any, b: any) => b.version_number - a.version_number);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/documents"
        className="mb-4 inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground press-apple"
      >
        <ArrowLeft className="h-4 w-4" />
        Documents
      </Link>

      <div className="mb-6 sm:mb-8 animate-apple-fade">
        <h1 className="font-serif text-[28px] sm:text-3xl font-semibold tracking-tight leading-tight">
          {document.name}
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground capitalize">
          {document.document_type.replace(/_/g, " ")}
        </p>
      </div>

      <StaggerContainer className="grid gap-6 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-[14px] text-muted-foreground text-center py-6">
                  No versions uploaded yet.
                </p>
              ) : (
                <div className="space-y-0">
                  {versions.map((v: any, i: number) => (
                    <div
                      key={v.id}
                      className={`flex items-center justify-between py-3 ${
                        i < versions.length - 1 ? "border-b border-border/30" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium">
                          v{v.version_number} — {v.file_name}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {v.mime_type} · {(v.file_size / 1024).toFixed(1)} KB
                          {v.notes && ` · ${v.notes}`}
                        </p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <p className="text-[12px] text-muted-foreground mb-1">
                          {new Date(v.created_at).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0 rounded-full">
                          <Link href={`/api/documents/download?path=${encodeURIComponent(v.storage_path)}&name=${encodeURIComponent(v.file_name)}`}>
                            <Download className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-border/30 pt-4">
                <DocumentUpload
                  documentId={id}
                  currentVersionNumber={versions[0]?.version_number || 0}
                />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5 text-[14px]">
                <FileText className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{document.document_type.replace(/_/g, " ")}</span>
              </div>
              {document.current_version_id && (
                <div className="flex items-center gap-2.5 text-[14px]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium">v{versions[0]?.version_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-[14px]">
                <Clock className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(document.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {document.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{document.notes}</p>
              </CardContent>
            </Card>
          )}
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
