"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { entrySchemas, type EntryKind } from "./schemas";
import { RelationshipError } from "./relationships";
import { type EntryChoices } from "./choices";
import {
  createProgram,
  createApplication,
  createDeadline,
  createTask,
} from "@/features/programs/actions";
import { createDocument, createDocumentRequirement } from "@/features/documents/actions";
import {
  createEssayPrompt,
  createRecommender,
  createRecommendationRequest,
  createContact,
} from "@/features/essays/actions";
import type { FormResult } from "@/components/domain/create-page";
import { createScholarshipApplication } from "@/features/scholarships/actions";

export async function getEntryChoices(): Promise<EntryChoices> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const responses = await Promise.all([
    client
      .from("institutions")
      .select("id,name,country_name")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("name")
      .limit(500),
    client
      .from("programs")
      .select("id,name,institution_id")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("name")
      .limit(500),
    client
      .from("applications")
      .select("id,program_id,status")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .limit(500),
    client
      .from("scholarships")
      .select("id,name")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("name")
      .limit(500),
    client
      .from("scholarship_applications")
      .select("id,scholarship_id,status")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .limit(500),
    client
      .from("recommenders")
      .select("id,name,institution")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("name")
      .limit(500),
    client
      .from("documents")
      .select("id,name")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("name")
      .limit(500),
    client.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    client
      .from("essay_prompts")
      .select("id,title")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("title")
      .limit(500),
    client
      .from("recommendation_requests")
      .select("id,recommender_id,application_id,scholarship_application_id")
      .eq("user_id", user.id)
      .limit(500),
  ]);
  if (responses.some((response) => response.error))
    throw new Error("We couldn’t load your choices. Check your connection and try again.");
  const [
    institutions,
    programs,
    applications,
    scholarships,
    scholarshipApplications,
    recommenders,
    documents,
    profile,
    essays,
    requests,
  ] = responses;
  const institutionIds = new Set((institutions.data || []).map((item) => item.id));
  const availablePrograms = (programs.data || []).filter((item) =>
    institutionIds.has(item.institution_id),
  );
  const programIds = new Set(availablePrograms.map((item) => item.id));
  const scholarshipIds = new Set((scholarships.data || []).map((item) => item.id));
  const availableApplications = (applications.data || []).filter((item) => programIds.has(item.program_id));
  const availableScholarshipApplications = (scholarshipApplications.data || []).filter((item) => scholarshipIds.has(item.scholarship_id));
  const applicationIds = new Set(availableApplications.map((item) => item.id));
  const scholarshipApplicationIds = new Set(availableScholarshipApplications.map((item) => item.id));
  const peopleIds = new Set((recommenders.data || []).map((item) => item.id));
  return {
    institutions: institutions.data || [],
    programs: availablePrograms,
    applications: availableApplications,
    scholarships: scholarships.data || [],
    scholarshipApplications: availableScholarshipApplications,
    recommenders: recommenders.data || [],
    documents: documents.data || [],
    essays: essays.data || [],
    requests: (requests.data || []).filter((item) => peopleIds.has(item.recommender_id) && (item.application_id ? applicationIds.has(item.application_id) : scholarshipApplicationIds.has(item.scholarship_application_id))),
    limited: responses.some(
      (response) => Array.isArray(response.data) && response.data.length === 500,
    ),
    timezone: (!Array.isArray(profile.data) && profile.data?.timezone) || "Africa/Accra",
  };
}

export async function createEntryFromForm(kind: EntryKind, form: FormData): Promise<FormResult> {
  try {
    if (!Object.hasOwn(entrySchemas, kind)) return { error: "Choose a supported entry type." };
    const raw: Record<string, unknown> = Object.fromEntries(form);
    if (kind === "scholarship") raw.program_ids = [...new Set(form.getAll("program_ids"))];
    for (const key of [
      "blocking",
      "is_required",
      "is_date_only",
      "is_hard_deadline",
      "nomination_required",
    ])
      if (form.has(key)) raw[key] = ["on", "true"].includes(String(form.get(key)));
    let id: string;
    switch (kind) {
      case "scholarshipApplication":
        id = (await createScholarshipApplication(entrySchemas.scholarshipApplication.parse(raw)))
          .id;
        break;
      case "scholarship": {
        const input = entrySchemas.scholarship.parse(raw);
        const client = await createClient();
        const {
          data: { user },
        } = await client.auth.getUser();
        if (!user) return { error: "Please sign in again." };
        const { data, error } = await client.rpc("create_scholarship_entry", { p_input: input });
        if (error || typeof data !== "string") throw new Error("Unable to save scholarship.");
        id = data;
        break;
      }
      case "program":
        id = (await createProgram(entrySchemas.program.parse(raw))).id;
        break;
      case "application":
        id = (await createApplication(entrySchemas.application.parse(raw))).id;
        break;
      case "deadline":
        id = (await createDeadline(entrySchemas.deadline.parse(raw))).id;
        break;
      case "task":
        id = (await createTask(entrySchemas.task.parse(raw))).id;
        break;
      case "essay":
        id = (await createEssayPrompt(entrySchemas.essay.parse(raw))).id;
        break;
      case "document":
        id = (await createDocument(entrySchemas.document.parse(raw))).id;
        break;
      case "requirement":
        id = (await createDocumentRequirement(entrySchemas.requirement.parse(raw))).id;
        break;
      case "recommender":
        id = (await createRecommender(entrySchemas.recommender.parse(raw))).id;
        break;
      case "contact":
        id = (await createContact(entrySchemas.contact.parse(raw))).id;
        break;
      case "recommendation":
        id = (await createRecommendationRequest(entrySchemas.recommendation.parse(raw))).id;
        break;
      case "institution": {
        const input = entrySchemas.institution.parse(raw);
        const client = await createClient();
        const {
          data: { user },
        } = await client.auth.getUser();
        if (!user) return { error: "Please sign in again." };
        const { data, error } = await client
          .from("institutions")
          .insert({ ...input, user_id: user.id })
          .select("id")
          .single();
        if (error || !data) throw new Error("Unable to save.");
        id = data.id;
        break;
      }
    }
    revalidatePath("/", "layout");
    return { id };
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        error: "Review the highlighted fields.",
        fieldErrors: Object.fromEntries(
          error.issues.map((issue) => [String(issue.path[0] || "_form"), issue.message]),
        ),
      };
    if (error instanceof RelationshipError)
      return { error: error.message, fieldErrors: { [error.field]: error.message } };
    if (
      error instanceof Error &&
      /valid date|valid timezone|clocks change|Choose another time|unambiguous time/.test(
        error.message,
      )
    )
      return { error: error.message, fieldErrors: { due_at: error.message } };
    return {
      error: "We couldn’t save this entry. Check your connection and selections, then try again.",
    };
  }
}
