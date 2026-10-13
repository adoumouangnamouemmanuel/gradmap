"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, AlertCircle, Loader2, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFileVersion } from "@/features/documents/workspace-actions";

interface DocumentUploadProps {
  documentId: string;
  currentVersionNumber: number;
  onUploadComplete?: () => void;
}

import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES } from "@/features/documents/upload-validation";
const ALLOWED_TYPES: readonly string[] = DOCUMENT_MIME_TYPES;
const MAX_SIZE = MAX_DOCUMENT_BYTES;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({
  documentId,
  currentVersionNumber,
  onUploadComplete,
}: DocumentUploadProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    chooseFile(file);
  }

  function chooseFile(file: File) {
    if (isUploading) return;
    setError(null);
    setSuccess(false);
    setSelectedFile(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type "${file.type}" is not allowed. Accepted: PDF, JPEG, PNG, DOCX`);
      return;
    }
    if (file.size === 0 || file.size > MAX_SIZE) {
      setError(`File is ${formatSize(file.size)}. Maximum is 20 MB.`);
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setError(null);

    try {
      // Convert file to base64, send everything to the server action
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Convert to base64 in chunks to avoid stack overflow
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);

      const result = await uploadFileVersion({
        document_id: documentId,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        file_base64: base64,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setSelectedFile(null);
      router.refresh();
      onUploadComplete?.();
    } catch {
      setError(
        "This file couldn’t save. Check the file type and connection, then retry. Your earlier versions are unchanged.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile && (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) chooseFile(file);
          }}
          className={`flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-7 text-center transition-colors ${dragging ? "border-primary bg-primary/10" : "border-primary/25 bg-primary/5 hover:bg-primary/10"}`}
        >
          <span className="bg-card text-primary rounded-2xl p-3">
            <Upload size={22} />
          </span>
          <span className="text-sm font-medium">Choose a file or drop it here</span>
          <span className="text-muted-foreground text-xs">
            Private upload · previous versions stay available
          </span>
        </button>
      )}

      {/* File preview */}
      {selectedFile && !isUploading && !success && (
        <div className="border-border/50 bg-muted/20 animate-content-enter flex items-center gap-3 rounded-[12px] border p-3">
          <div className="bg-primary/[0.08] text-primary/60 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px]">
            <File className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium">{selectedFile.name}</p>
            <p className="text-muted-foreground text-[12px]">{formatSize(selectedFile.size)}</p>
          </div>
          <button
            aria-label="Remove selected file"
            onClick={() => setSelectedFile(null)}
            className="hover:bg-accent press-apple rounded-full p-1.5"
          >
            <X className="text-muted-foreground/50 h-[16px] w-[16px]" />
          </button>
        </div>
      )}

      {selectedFile && !isUploading && !success && (
        <Button onClick={handleUpload} className="w-full rounded-[12px]">
          <Upload className="mr-2 h-4 w-4" />
          Upload v{currentVersionNumber + 1}
        </Button>
      )}

      {isUploading && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-[14px]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="text-destructive animate-content-enter flex items-center gap-2 text-[13px]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="animate-content-enter flex items-center gap-2 text-[13px] text-emerald-600"
        >
          <FileCheck className="h-4 w-4 shrink-0" />
          Uploaded successfully!
        </div>
      )}

      <p className="text-muted-foreground/50 text-[11px]">PDF, JPEG, PNG, DOCX · Max 20 MB</p>
    </div>
  );
}
