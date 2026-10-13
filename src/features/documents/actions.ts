"use server";

import { z } from "zod";
import { randomUUID, createHash } from "node:crypto";
import {
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  documentVersionSchema,
  validateDocumentBytes,
} from "./upload-validation";
import { guardEntry } from "@/features/entries/relationships";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function getDocuments() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error.message);
    return [];
  }
  return data || [];
}

export async function getDocument(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("documents")
    .select("*, document_versions!document_versions_document_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching document:", error.message);
    throw new Error(`Could not load document: ${error.message}`);
  }

  if (!data) {
    throw new Error("Document not found - it may not exist or you may not have access.");
  }

  return data;
}

export async function createDocument(formData: {
  name: string;
  document_type?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("document", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      name: formData.name,
      document_type: formData.document_type || "other",
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "document",
    entity_id: data.id,
    action: "created",
    summary: `Created document: ${formData.name}`,
  });

  revalidatePath("/documents");
  return data;
}

export async function updateDocument(
  id: string,
  formData: {
    name?: string;
    document_type?: string;
    notes?: string;
  },
) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("documents")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return data;
}

export async function archiveDocument(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("documents")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/documents");
}

// ============================================================
// DOCUMENT VERSIONS
// ============================================================

export async function getDocumentVersions(documentId: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("Error fetching document versions:", error.message);
    return [];
  }
  return data || [];
}

export async function createDocumentVersion(formData: {
  document_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  sha256_hash?: string;
  notes?: string;
}) {
  const input = documentVersionSchema.parse(formData);
  const { supabase, user } = await getUser();
  if (
    !user ||
    !input.storage_path.startsWith(user.id + "/" + input.document_id + "/") ||
    input.storage_path.includes("..")
  )
    throw new Error("This file is unavailable.");
  const { data: id, error } = await supabase.rpc("create_document_revision", {
    p_document_id: input.document_id,
    p_file_name: input.file_name,
    p_mime_type: input.mime_type,
    p_file_size: input.file_size,
    p_storage_path: input.storage_path,
    p_sha256: input.sha256_hash || null,
    p_notes: input.notes || null,
  });
  if (error || !id) throw new Error("File version saving is temporarily unavailable.");
  const { data, error: readError } = await supabase
    .from("document_versions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (readError || !data)
    throw new Error("The version saved but could not reload. Refresh before uploading again.");
  revalidatePath("/documents");
  revalidatePath("/documents/" + input.document_id);
  return data;
}

// ============================================================
// DOCUMENT REQUIREMENTS
// ============================================================

export async function getDocumentRequirements(applicationId?: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  let query = supabase
    .from("document_requirements")
    .select(
      "*, document_versions!document_requirements_satisfied_by_version_id_fkey(file_name, version_number)",
    )
    .eq("user_id", user.id)
    .order("created_at")
    .limit(500);

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error("Document requirements couldn’t load. Please retry.");
  }
  return data || [];
}

export async function createDocumentRequirement(formData: {
  application_id?: string;
  scholarship_application_id?: string;
  requirement_name: string;
  document_type?: string;
  is_required?: boolean;
  due_at?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("requirement", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("document_requirements")
    .insert({
      user_id: user.id,
      application_id: formData.application_id || null,
      scholarship_application_id: formData.scholarship_application_id || null,
      requirement_name: formData.requirement_name,
      document_type: formData.document_type || "other",
      is_required: formData.is_required !== false,
      due_at: formData.due_at || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/applications");
  revalidatePath("/documents");
  return data;
}

export async function uploadDocumentVersion(formData: {
  document_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  file_base64: string;
}) {
  const input = z
    .object({
      document_id: z.string().uuid(),
      file_name: z.string().min(1).max(200),
      mime_type: z.enum(DOCUMENT_MIME_TYPES),
      file_size: z.number().int().min(1).max(MAX_DOCUMENT_BYTES),
      file_base64: z
        .string()
        .max(Math.ceil(MAX_DOCUMENT_BYTES / 3) * 4)
        .regex(/^[A-Za-z0-9+/]*={0,2}$/),
    })
    .parse(formData);
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Please sign in again.");
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id")
    .eq("id", input.document_id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();
  if (documentError || !document) throw new Error("This document is no longer available.");
  const bytes = Buffer.from(input.file_base64, "base64");
  validateDocumentBytes(bytes, input.mime_type, input.file_name, input.file_size);
  const filename = input.file_name.normalize("NFKC").replace(/[\\/\x00-\x1f\x7f]/g, "_");
  const extension =
    input.mime_type === "application/pdf"
      ? "pdf"
      : input.mime_type === "image/png"
        ? "png"
        : input.mime_type === "image/jpeg"
          ? "jpg"
          : "docx";
  const storagePath = user.id + "/" + input.document_id + "/" + randomUUID() + "." + extension;
  const { error: uploadError } = await supabase.storage
    .from("application-files")
    .upload(storagePath, bytes, {
      contentType: input.mime_type,
      cacheControl: "0",
      upsert: false,
    });
  if (uploadError) {
    console.error("document_upload_failed", {
      code: uploadError.name,
      message: uploadError.message,
    });
    throw new Error(
      uploadError.message.toLowerCase().includes("bucket")
        ? "Document storage is not configured. Apply the latest Supabase migrations and retry."
        : "The file could not upload. Check your connection and try again.",
    );
  }
  const { data: versionId, error: metadataError } = await supabase.rpc("create_document_revision", {
    p_document_id: input.document_id,
    p_file_name: filename,
    p_mime_type: input.mime_type,
    p_file_size: bytes.length,
    p_storage_path: storagePath,
    p_sha256: createHash("sha256").update(bytes).digest("hex"),
    p_notes: null,
  });
  if (metadataError || !versionId) {
    // A lost RPC response can follow a committed transaction. Never delete its file.
    const { data: committed, error: lookupError } = await supabase
      .from("document_versions")
      .select("id")
      .eq("storage_path", storagePath)
      .eq("user_id", user.id)
      .maybeSingle();
    if (committed) {
      revalidatePath("/documents");
      revalidatePath("/documents/" + input.document_id);
      return { id: committed.id };
    }
    if (lookupError)
      throw new Error(
        "The save result is uncertain. Refresh this document before retrying; your file has been preserved.",
      );
    if (
      !metadataError ||
      !["42501", "22023", "23503", "23514", "23505", "PGRST202", "42883"].includes(
        metadataError.code,
      )
    )
      throw new Error(
        "The save result is uncertain. Refresh this document before retrying; your file has been preserved.",
      );
    const { error: cleanupError } = await supabase.storage
      .from("application-files")
      .remove([storagePath]);
    if (cleanupError) console.error("document_upload_cleanup_failed", { code: cleanupError.name });
    throw new Error(
      "This file version couldn’t save. Please retry when the workspace is available.",
    );
  }
  revalidatePath("/documents");
  revalidatePath("/documents/" + input.document_id);
  return { id: versionId };
}

export async function satisfyDocumentRequirement(id: string, versionId: string) {
  z.string().uuid().parse(id);
  z.string().uuid().parse(versionId);
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Please sign in again.");
  const [{ data: requirement }, { data: version }] = await Promise.all([
    supabase
      .from("document_requirements")
      .select("id,document_type")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("document_versions")
      .select("id,document_id")
      .eq("id", versionId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!requirement || !version) throw new Error("This requirement or file is unavailable.");
  const { data: document } = await supabase
    .from("documents")
    .select("document_type")
    .eq("id", version.document_id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();
  if (
    !document ||
    (requirement.document_type &&
      requirement.document_type !== "other" &&
      document.document_type !== requirement.document_type)
  )
    throw new Error("Choose a matching document type.");
  const { error, data } = await supabase
    .from("document_requirements")
    .update({ satisfied_by_version_id: versionId })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();
  if (error || !data) throw new Error("This requirement couldn’t update.");
  revalidatePath("/applications", "layout");
  revalidatePath("/documents");
  revalidatePath("/calendar");
}
