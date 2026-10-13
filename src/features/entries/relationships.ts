import { entrySchemas, type EntryKind } from "./schemas";
import { localToInstant } from "@/features/planning/dates";
import type { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type ParentTable =
  | "institutions"
  | "programs"
  | "applications"
  | "scholarships"
  | "scholarship_applications"
  | "recommenders"
  | "documents"
  | "essay_prompts"
  | "recommendation_requests"
  | "document_versions";
export type ParentRecord = {
  id: string;
  institution_id?: string;
  program_id?: string;
  scholarship_id?: string;
  recommender_id?: string;
  user_id?: string;
  archived_at?: string | null;
  application_id?: string | null;
  scholarship_application_id?: string | null;
};
export type ParentLookup = (table: ParentTable, id: string) => Promise<ParentRecord | null>;
const parentColumns: Record<ParentTable, string> = {
  institutions: "id,archived_at", programs: "id,institution_id,archived_at", applications: "id,program_id,archived_at",
  scholarships: "id,archived_at", scholarship_applications: "id,scholarship_id,archived_at", recommenders: "id,archived_at",
  documents: "id,archived_at", essay_prompts: "id,application_id,scholarship_application_id,archived_at",
  recommendation_requests: "id,recommender_id,application_id,scholarship_application_id", document_versions: "id",
};
const parentSchema = z.object({ id: z.string().uuid(), archived_at: z.string().nullable().optional(), institution_id: z.string().uuid().optional(), program_id: z.string().uuid().optional(), scholarship_id: z.string().uuid().optional(), recommender_id: z.string().uuid().optional(), application_id: z.string().uuid().nullable().optional(), scholarship_application_id: z.string().uuid().nullable().optional() });
export class RelationshipError extends Error {
  constructor(public field: string) {
    super("This selection is no longer available. Refresh the choices or create a new entry.");
  }
}

export async function validateRelationships(input: Record<string, unknown>, lookup: ParentLookup) {
  const mappings: Array<[string, ParentTable]> = [
    ["institution_id", "institutions"],
    ["program_id", "programs"],
    ["application_id", "applications"],
    ["scholarship_id", "scholarships"],
    ["scholarship_application_id", "scholarship_applications"],
    ["recommender_id", "recommenders"],
    ["document_id", "documents"],
    ["essay_prompt_id", "essay_prompts"],
    ["recommendation_request_id", "recommendation_requests"],
  ];
  async function get(table: ParentTable, id: string, field: string) {
    const record = await lookup(table, id);
    if (!record || record.archived_at) throw new RelationshipError(field);
    return record;
  }
  async function programChain(id: string, field: string) {
    const program = await get("programs", id, field);
    if (!program.institution_id) throw new RelationshipError(field);
    await get("institutions", program.institution_id, field);
    if (input.institution_id && program.institution_id !== input.institution_id)
      throw new RelationshipError("program_id");
  }
  for (const [field, table] of mappings) {
    if (typeof input[field] !== "string" || !input[field]) continue;
    const record = await get(table, input[field], field);
    if (table === "programs") await programChain(record.id, field);
    if (table === "applications") {
      if (!record.program_id) throw new RelationshipError(field);
      await programChain(record.program_id, field);
    }
    if (table === "scholarship_applications") {
      if (!record.scholarship_id) throw new RelationshipError(field);
      await get("scholarships", record.scholarship_id, field);
    }
    if (["essay_prompts", "recommendation_requests"].includes(table)) {
      if (table === "recommendation_requests") {
        if (!record.recommender_id) throw new RelationshipError(field);
        await get("recommenders", record.recommender_id, field);
      }
      if (record.application_id) {
        const application = await get("applications", record.application_id, field);
        if (!application.program_id) throw new RelationshipError(field);
        await programChain(application.program_id, field);
      }
      if (record.scholarship_application_id) {
        const application = await get(
          "scholarship_applications",
          record.scholarship_application_id,
          field,
        );
        if (!application.scholarship_id) throw new RelationshipError(field);
        await get("scholarships", application.scholarship_id, field);
      }
    }
    if (
      input.application_id &&
      ["essay_prompts", "recommendation_requests"].includes(table) &&
      record.application_id &&
      record.application_id !== input.application_id
    )
      throw new RelationshipError(field);
  }
}

export async function guardEntry(
  kind: EntryKind,
  input: object,
  client: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const parsed = entrySchemas[kind].parse(input);
  await validateRelationships(parsed, async (table, id) => {
    const { data, error } = await client
      .from(table)
      .select(parentColumns[table])
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new RelationshipError(table);
    if (!data) return null;
    return parentSchema.parse(data);
  });
  if ("due_at" in parsed && parsed.due_at) {
    let timezone = "timezone" in input && typeof input.timezone === "string" ? input.timezone : undefined;
    if (!timezone) {
      const { data: profile, error } = await client.from("profiles").select("timezone").eq("id", userId).maybeSingle();
      if (error) throw new Error("Choose a valid timezone before saving this date.");
      timezone = typeof profile?.timezone === "string" && profile.timezone ? String(profile.timezone) : "Africa/Accra";
    }
    const normalized = localToInstant(parsed.due_at, timezone);
    Object.assign(input, { due_at: normalized });
  }
}
