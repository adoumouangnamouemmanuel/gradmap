import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Clock, CheckCircle2, Download } from "lucide-react";
import { getDocument } from "@/features/documents/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/domain/document-upload";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let document;
  try {
    document = await getDocument(id);
  } catch {
    notFound();
  }

  const versions = (document.document_versions || [])
    .sort((a: any, b: any) => b.version_number - a.version_number);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/documents"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Documents
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {document.name}
        </h1>
        <p className="mt-1 text-muted-foreground capitalize">
          {document.document_type.replace(/_/g, " ")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No versions uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          v{v.version_number} — {v.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {v.mime_type} · {(v.file_size / 1024).toFixed(1)} KB
                          {v.notes && ` · ${v.notes}`}
                        </p>
                        {v.sha256_hash && (
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                            SHA-256: {v.sha256_hash.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(v.created_at).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`/api/documents/download?path=${encodeURIComponent(v.storage_path)}&name=${encodeURIComponent(v.file_name)}`}>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <DocumentUpload
                  documentId={id}
                  currentVersionNumber={versions[0]?.version_number || 0}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{document.document_type.replace(/_/g, " ")}</span>
              </div>
              {document.current_version_id && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Current version:</span>
                  <span className="font-medium">v{versions[0]?.version_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
