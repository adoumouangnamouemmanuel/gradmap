"use server";

import { z } from "zod";
import { guardEntry } from "@/features/entries/relationships";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// ============================================================
// ESSAY PROMPTS
// ============================================================

export async function getEssayPrompts() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("essay_prompts")
    .select("*, applications!essay_prompts_application_owner_fkey(program_id, programs!applications_program_id_fkey(name))")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching essay prompts:", error.message);
    return [];
  }
  return data || [];
}

export async function getEssayPrompt(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("essay_prompts")
    .select("*, essay_versions!essay_versions_essay_prompt_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEssayPrompt(formData: {
  title: string;
  prompt_text?: string;
  word_limit?: number;
  character_limit?: number;
  application_id?: string;
  scholarship_application_id?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("essay", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("essay_prompts")
    .insert({
      user_id: user.id,
      title: formData.title,
      prompt_text: formData.prompt_text || null,
      word_limit: formData.word_limit || null,
      character_limit: formData.character_limit || null,
      application_id: formData.application_id || null,
      scholarship_application_id: formData.scholarship_application_id || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "essay_prompt",
    entity_id: data.id,
    action: "created",
    summary: `Created essay prompt: ${formData.title}`,
  });

  revalidatePath("/essays");
  return data;
}

export async function updateEssayPromptStatus(id: string, status: string) {
  z.string().uuid().parse(id); z.enum(["not_started", "outlining", "drafting", "reviewing", "final", "submitted"]).parse(status);
  const { supabase, user } = await getUser(); if (!user) throw new Error("Please sign in again.");
  if (["final", "submitted"].includes(status)) {
    const { data: prompt } = await supabase.from("essay_prompts").select("current_version_id,word_limit,character_limit").eq("id", id).eq("user_id", user.id).is("archived_at", null).maybeSingle();
    if (!prompt?.current_version_id) throw new Error("Save a revision before marking this writing final or submitted.");
    const { data: version } = await supabase.from("essay_versions").select("word_count,character_count").eq("id", prompt.current_version_id).eq("essay_prompt_id", id).eq("user_id", user.id).maybeSingle();
    if (!version || prompt.word_limit && version.word_count > prompt.word_limit || prompt.character_limit && version.character_count > prompt.character_limit) throw new Error("The saved revision exceeds its submission limit. Edit it before marking it final or submitted.");
  }
  const { data, error } = await supabase.from("essay_prompts").update({ status }).eq("id", id).eq("user_id", user.id).is("archived_at", null).select().single();
  if (error || !data) throw new Error("Writing status couldn’t save.");
  revalidatePath("/essays"); revalidatePath('/essays/' + id); revalidatePath("/applications", "layout");
  return data;
}

// ============================================================
// ESSAY VERSIONS
// ============================================================

export async function createEssayVersion(formData: { essay_prompt_id: string; content: string; notes?: string }) {
  const input = z.object({ essay_prompt_id: z.string().uuid(), content: z.string().min(1).max(1000000).refine((value) => !!value.trim()), notes: z.string().max(10000).optional() }).parse(formData);
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Please sign in again.");
  const { data: id, error } = await supabase.rpc("create_essay_revision", { p_prompt_id: input.essay_prompt_id, p_content: input.content, p_notes: input.notes || null });
  if (error || !id) throw new Error("The revision save couldn’t be confirmed. Refresh the writing history before retrying.");
  const { data, error: readError } = await supabase.from("essay_versions").select("*").eq("id", id).eq("user_id", user.id).single();
  if (readError || !data) throw new Error("The revision saved but could not reload. Refresh before saving another copy.");
  revalidatePath("/essays"); revalidatePath('/essays/' + input.essay_prompt_id); revalidatePath("/applications", "layout");
  return data;
}

// ============================================================
// RECOMMENDERS
// ============================================================

export async function getRecommenders() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recommenders")
    .select("*")
    .is("archived_at", null)
    .order("name");

  if (error) {
    console.error("Error fetching recommenders:", error.message);
    return [];
  }
  return data || [];
}

export async function getRecommender(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("recommenders")
    .select("*, recommendation_requests!recommendation_requests_recommender_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRecommender(formData: {
  name: string;
  email?: string;
  title?: string;
  institution?: string;
  relationship?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("recommender", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("recommenders")
    .insert({
      user_id: user.id,
      name: formData.name,
      email: formData.email || null,
      title: formData.title || null,
      institution: formData.institution || null,
      relationship: formData.relationship || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "recommender",
    entity_id: data.id,
    action: "created",
    summary: `Added recommender: ${formData.name}`,
  });

  revalidatePath("/recommenders");
  return data;
}

// ============================================================
// RECOMMENDATION REQUESTS
// ============================================================

export async function getRecommendationRequests() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recommendation_requests")
    .select("*, recommenders!recommendation_requests_recommender_owner_fkey(name, email)")
    .order("due_at", { ascending: true });

  if (error) {
    console.error("Error fetching recommendation requests:", error.message);
    return [];
  }
  return data || [];
}

export async function createRecommendationRequest(formData: {
  recommender_id: string;
  application_id?: string;
  scholarship_application_id?: string;
  due_at?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("recommendation", formData, supabase, user.id);

  // Ensure datetime-local values get seconds for PostgreSQL timestamptz
  let isoDueAt: string | null = null;
  if (formData.due_at) {
    const formatted = formData.due_at.length === 16 ? formData.due_at + ":00" : formData.due_at;
    isoDueAt = new Date(formatted).toISOString();
  }

  const { data, error } = await supabase
    .from("recommendation_requests")
    .insert({
      user_id: user.id,
      recommender_id: formData.recommender_id,
      status: "pending",
      application_id: formData.application_id || null,
      scholarship_application_id: formData.scholarship_application_id || null,
      due_at: isoDueAt,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "recommendation_request",
    entity_id: data.id,
    action: "created",
    summary: `Created recommendation request`,
  });

  revalidatePath("/recommenders");
  return data;
}

export async function updateRecommendationRequestStatus(id: string, status: string) {
  z.string().uuid().parse(id);
  z.enum(["pending", "sent", "accepted", "submitted", "declined"]).parse(status);
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Please sign in again.");
  const { data, error } = await supabase
    .from("recommendation_requests")
    .update({
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/recommenders");
  revalidatePath("/calendar");
  revalidatePath("/applications", "layout");
  return data;
}

// ============================================================
// CONTACTS
// ============================================================

export async function getContacts() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .is("archived_at", null)
    .order("name");

  if (error) {
    console.error("Error fetching contacts:", error.message);
    return [];
  }
  return data || [];
}

export async function getContact(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("contacts")
    .select("*, contact_interactions!contact_interactions_contact_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createContact(formData: {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  institution?: string;
  program_id?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("contact", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      role: formData.role || null,
      institution: formData.institution || null,
      program_id: formData.program_id || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "contact",
    entity_id: data.id,
    action: "created",
    summary: `Added contact: ${formData.name}`,
  });

  revalidatePath("/contacts");
  return data;
}

// ============================================================
// CONTACT INTERACTIONS
// ============================================================

export async function createContactInteraction(formData: {
  contact_id: string;
  interaction_type?: string;
  summary: string;
  happened_at?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("contact_interactions")
    .insert({
      user_id: user.id,
      contact_id: formData.contact_id,
      interaction_type: formData.interaction_type || "email",
      summary: formData.summary,
      happened_at: formData.happened_at || new Date().toISOString(),
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${formData.contact_id}`);
  return data;
}

// ============================================================
// UPDATE / ARCHIVE
// ============================================================

export async function updateRecommender(id: string, formData: {
  name?: string;
  email?: string;
  title?: string;
  institution?: string;
  relationship?: string;
  notes?: string;
}) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("recommenders")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/recommenders");
  revalidatePath(`/recommenders/${id}`);
  return data;
}

export async function archiveRecommender(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("recommenders")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/recommenders");
}

export async function updateContact(id: string, formData: {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  institution?: string;
  notes?: string;
}) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("contacts")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return data;
}

export async function archiveContact(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("contacts")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/contacts");
}
