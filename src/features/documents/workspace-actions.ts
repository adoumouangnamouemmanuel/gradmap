"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { satisfyDocumentRequirement, uploadDocumentVersion } from "./actions";
import { updateRecommendationRequestStatus } from "@/features/essays/actions";
import { materialWorkspaceSchema, type MaterialWorkspaceData } from "./workspace";

export async function uploadFileVersion(
  input: Parameters<typeof uploadDocumentVersion>[0],
): Promise<{ id?: string; error?: string }> {
  try {
    return await uploadDocumentVersion(input);
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message.startsWith("The save result is uncertain.")
          ? "The save result is uncertain. Refresh this document before retrying; your file has been preserved."
          : "This file couldn’t save. Check the file type and connection, then retry. Your earlier versions are unchanged.",
    };
  }
}

export async function getMaterialWorkspace(kind: "documents" | "essays" | "recommendations", options: { tab?: string; query?: string; applicationId?: string; page?: number } = {}): Promise<MaterialWorkspaceData> {
  const parsed = z.object({ kind: z.enum(["documents", "essays", "recommendations"]), tab: z.enum(["primary", "secondary"]).default("primary"), query: z.string().trim().max(120).default(""), applicationId: z.string().uuid().optional(), page: z.number().int().min(1).max(10000).default(1) }).parse({ kind, ...options });
  const client = await createClient(); const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const { data, error } = await client.rpc("get_preparation_page", { p_kind: parsed.kind, p_tab: parsed.tab, p_query: parsed.query, p_application_id: parsed.applicationId || null, p_page: parsed.page });
  if (error) throw new Error("This preparation view couldn’t load. Please retry.");
  return materialWorkspaceSchema.parse(data);
}

export async function linkRequirementVersion(
  id: string,
  versionId: string,
): Promise<{ error?: string }> {
  if (!z.string().uuid().safeParse(id).success || !z.string().uuid().safeParse(versionId).success)
    return { error: "Choose an available file version." };
  try {
    await satisfyDocumentRequirement(id, versionId);
    return {};
  } catch {
    return {
      error:
        "This version couldn’t be linked. Check that it matches the requirement and is still available.",
    };
  }
}
export async function changeRecommendationStatus(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  if (
    !z.string().uuid().safeParse(id).success ||
    !z.enum(["pending", "sent", "accepted", "submitted", "declined"]).safeParse(status).success
  )
    return { error: "Choose a supported request stage." };
  try {
    await updateRecommendationRequestStatus(id, status);
    return {};
  } catch {
    return { error: "This request couldn’t be updated. Please reload and try again." };
  }
}
