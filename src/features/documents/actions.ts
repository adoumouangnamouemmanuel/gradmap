"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

export async function updateDocument(id: string, formData: {
  name?: string;
  document_type?: string;
  notes?: string;
}) {
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
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  // Get next version number
  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", formData.document_id)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version_number || 0) + 1;

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      user_id: user.id,
      document_id: formData.document_id,
      version_number: nextVersion,
      file_name: formData.file_name,
      mime_type: formData.mime_type,
      file_size: formData.file_size,
      storage_path: formData.storage_path,
      sha256_hash: formData.sha256_hash || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Update current_version_id on parent document
  await supabase
    .from("documents")
    .update({ current_version_id: data.id })
    .eq("id", formData.document_id);

  revalidatePath("/documents");
  revalidatePath(`/documents/${formData.document_id}`);
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
    .select("*, document_versions!satisfied_by_version_id(file_name, version_number)")
    .order("created_at");

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching document requirements:", error.message);
    return [];
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

export async function createDocumentVersionFromUpload(formData: {
  document_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  sha256_hash?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify document belongs to user
  const { data: doc } = await supabase
    .from("documents")
    .select("id")
    .eq("id", formData.document_id)
    .eq("user_id", user.id)
    .single();

  if (!doc) throw new Error("Document not found");

  // Get next version number
  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", formData.document_id)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version_number || 0) + 1;

  const { data: version, error } = await supabase
    .from("document_versions")
    .insert({
      user_id: user.id,
      document_id: formData.document_id,
      version_number: nextVersion,
      file_name: formData.file_name,
      mime_type: formData.mime_type,
      file_size: formData.file_size,
      storage_path: formData.storage_path,
      sha256_hash: formData.sha256_hash || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Update current_version_id on parent document
  await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", formData.document_id);

  revalidatePath("/documents");
  revalidatePath(`/documents/${formData.document_id}`);
  return version;
}

export async function satisfyDocumentRequirement(id: string, versionId: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("document_requirements")
    .update({ satisfied_by_version_id: versionId })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/applications");
  revalidatePath("/documents");
}
