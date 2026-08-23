import Link from "next/link";
import { ArrowLeft, FileText, Clock, CheckCircle2, Download, AlertCircle } from "lucide-react";
import { getDocument } from "@/features/documents/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/domain/document-upload";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let document;
  try { document = await getDocument(id); } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/documents" className="mb-4 inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground press-apple"><ArrowLeft className="h-4 w-4" /> Documents</Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-destructive/[0.08] text-destructive/60 animate-scale-in"><AlertCircle className="h-7 w-7" /></div>
            <h3 className="text-[17px] font-semibold">Document not found</h3>
            <p className="mt-1.5 max-w-[260px] text-[14px] text-muted-foreground leading-relaxed">This document may not exist, or you may not have access to it.</p>
            <Button asChild className="mt-5 rounded-[12px]"><Link href="/documents">Back to documents</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const versions = (document.document_versions || []).sort((a: any, b: any) => b.version_number - a.version_number);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/documents" className="mb-4 inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground press-apple"><ArrowLeft className="h-4 w-4" /> Documents</Link>

      <div className="mb-5 animate-content-enter">
        <h1 className="text-[34px] font-bold tracking-tight leading-[1.1]">{document.name}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground capitalize">{document.document_type.replace(/_/g, " ")}</p>
      </div>

      <StaggerContainer className="grid gap-5 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-[16px]">Versions</CardTitle></CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-[14px] text-muted-foreground text-center py-6">No versions uploaded yet.</p>
              ) : (
                <GroupedList>
                  {versions.map((v: any, i: number) => (
                    <MobileListItem
                      key={v.id}
                      index={i}
                      title={`v${v.version_number} — ${v.file_name}`}
                      subtitle={`${v.mime_type} · ${(v.file_size / 1024).toFixed(1)} KB${v.notes ? ` · ${v.notes}` : ""}`}
                      indicator={<FileText className="h-[16px] w-[16px] text-muted-foreground/40" />}
                      action={
                        <Button size="sm" variant="ghost" asChild className="h-[32px] w-[32px] p-0 rounded-full">
                          <Link href={`/api/documents/download?path=${encodeURIComponent(v.storage_path)}&name=${encodeURIComponent(v.file_name)}`}>
                            <Download className="h-[14px] w-[14px]" />
                          </Link>
                        </Button>
                      }
                      showChevron={false}
                    />
                  ))}
                </GroupedList>
              )}
              <div className="mt-4 border-t border-border/30 pt-4">
                <DocumentUpload documentId={id} currentVersionNumber={versions[0]?.version_number || 0} />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-[16px]">Info</CardTitle></CardHeader>
            <CardContent>
              <GroupedList>
                <MobileListItem title="Type" subtitle={document.document_type.replace(/_/g, " ")} indicator={<FileText className="h-[16px] w-[16px] text-muted-foreground/40" />} showChevron={false} />
                {document.current_version_id && <MobileListItem title="Current" subtitle={`v${versions[0]?.version_number}`} indicator={<CheckCircle2 className="h-[16px] w-[16px] text-emerald-500" />} showChevron={false} />}
                <MobileListItem title="Created" subtitle={new Date(document.created_at).toLocaleDateString()} indicator={<Clock className="h-[16px] w-[16px] text-muted-foreground/40" />} showChevron={false} />
              </GroupedList>
            </CardContent>
          </Card>
          {document.notes && (
            <Card>
              <CardHeader><CardTitle className="text-[16px]">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-[14px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{document.notes}</p></CardContent>
            </Card>
          )}
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
