"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, AlertCircle, Loader2, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createDocumentVersionFromUpload } from "@/features/documents/actions";

interface DocumentUploadProps {
  documentId: string;
  currentVersionNumber: number;
  onUploadComplete?: () => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_SIZE = 20 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({ documentId, currentVersionNumber, onUploadComplete }: DocumentUploadProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(false);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type "${file.type}" is not allowed. Accepted: PDF, JPEG, PNG, WebP, DOC, DOCX, TXT`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File is ${formatSize(file.size)}. Maximum is 20 MB.`);
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const versionNumber = currentVersionNumber + 1;
      const ext = selectedFile.name.split(".").pop() || "bin";
      const storagePath = `${user.id}/${documentId}/v${versionNumber}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("application-files")
        .upload(storagePath, selectedFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Save metadata via Server Action (fixes RLS)
      await createDocumentVersionFromUpload({
        document_id: documentId,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        storage_path: storagePath,
      });

      setSuccess(true);
      setSelectedFile(null);
      router.refresh();
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File preview */}
      {selectedFile && !isUploading && !success && (
        <div className="flex items-center gap-3 rounded-[12px] border border-border/50 bg-muted/20 p-3 animate-content-enter">
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-primary/[0.08] text-primary/60">
            <File className="h-[18px] w-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate">{selectedFile.name}</p>
            <p className="text-[12px] text-muted-foreground">{formatSize(selectedFile.size)}</p>
          </div>
          <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-full hover:bg-accent press-apple">
            <X className="h-[16px] w-[16px] text-muted-foreground/50" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !isUploading && !success && (
        <Button onClick={handleUpload} className="w-full rounded-[12px]">
          <Upload className="mr-2 h-4 w-4" />
          Upload v{currentVersionNumber + 1}
        </Button>
      )}

      {!selectedFile && (
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full rounded-[12px]">
          <Upload className="mr-2 h-4 w-4" />
          Choose file (v{currentVersionNumber + 1})
        </Button>
      )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2 py-3 text-[14px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-[13px] text-destructive animate-content-enter">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-[13px] text-emerald-600 animate-content-enter">
          <FileCheck className="h-4 w-4 shrink-0" />
          Uploaded successfully!
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/50">
        PDF, JPEG, PNG, WebP, DOC, DOCX, TXT · Max 20 MB
      </p>
    </div>
  );
}
