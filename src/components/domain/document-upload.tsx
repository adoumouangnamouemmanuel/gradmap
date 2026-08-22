"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DocumentUploadProps {
  documentId: string;
  currentVersionNumber: number;
  onUploadComplete?: () => void;
}

export function DocumentUpload({
  documentId,
  currentVersionNumber,
  onUploadComplete,
}: DocumentUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type "${file.type}" is not allowed. Accepted: PDF, JPEG, PNG, WebP, DOC, DOCX, TXT`);
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      setError(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 20MB.`);
      return;
    }

    setIsUploading(true);
    setProgress("Preparing upload...");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const versionNumber = currentVersionNumber + 1;
      const ext = file.name.split(".").pop() || "bin";
      const storagePath = `${user.id}/${documentId}/v${versionNumber}.${ext}`;

      setProgress("Uploading file...");

      const { error: uploadError } = await supabase.storage
        .from("application-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress("Saving metadata...");

      // Save version metadata (without hash)
      const response = await fetch("/api/documents/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save version metadata");
      }

      setSuccess(true);
      router.refresh();
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
        onChange={handleUpload}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress || "Uploading..."}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload file (v{currentVersionNumber + 1})
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <FileCheck className="h-4 w-4" />
          File uploaded successfully!
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Accepted: PDF, JPEG, PNG, WebP, DOC, DOCX, TXT · Max 20 MB
      </p>
    </div>
  );
}
