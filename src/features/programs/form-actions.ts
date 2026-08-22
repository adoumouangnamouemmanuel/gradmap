"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// INSTITUTION FORM ACTIONS
// ============================================================

export async function createInstitutionFromForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  if (!name) redirect("/programs/new?error=Name+is+required");

  const { data, error } = await supabase
    .from("institutions")
    .insert({
      user_id: user.id,
      name,
      country_code: formData.get("country_code") as string || null,
      country_name: formData.get("country_name") as string || null,
      city: formData.get("city") as string || null,
      website_url: formData.get("website_url") as string || null,
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/programs/new?error=" + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "institution",
    entity_id: data.id,
    action: "created",
    summary: `Created institution: ${name}`,
  });

  redirect("/programs/new");
}

// ============================================================
// PROGRAM FORM ACTIONS
// ============================================================

export async function createProgramFromForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const institutionId = formData.get("institution_id") as string;
  const name = formData.get("name") as string;
  if (!institutionId || !name) redirect("/programs/new?error=Institution+and+name+are+required");

  const { data, error } = await supabase
    .from("programs")
    .insert({
      user_id: user.id,
      institution_id: institutionId,
      name,
      degree_type: formData.get("degree_type") as string || null,
      department: formData.get("department") as string || null,
      field: formData.get("field") as string || null,
      intake_term: formData.get("intake_term") as string || null,
      intake_year: Number(formData.get("intake_year")) || 2027,
      duration_months: Number(formData.get("duration_months")) || null,
      delivery_mode: formData.get("delivery_mode") as string || null,
      program_url: formData.get("program_url") as string || null,
      status: "exploring",
      display_priority: Number(formData.get("display_priority")) || 3,
      research_notes: formData.get("research_notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/programs/new?error=" + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "program",
    entity_id: data.id,
    action: "created",
    summary: `Created program: ${name}`,
  });

  redirect(`/programs/${data.id}`);
}

// ============================================================
// APPLICATION FORM ACTIONS
// ============================================================

export async function createApplicationFromForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const programId = formData.get("program_id") as string;
  if (!programId) redirect("/applications/new?error=Program+is+required");

  const initialStatus = (formData.get("status") as string) || "researching";

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      program_id: programId,
      status: initialStatus,
      priority: Number(formData.get("priority")) || 3,
      application_round: formData.get("application_round") as string || null,
      portal_url: formData.get("portal_url") as string || null,
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/applications/new?error=" + encodeURIComponent(error.message));

  // Record initial status in history
  await supabase.from("application_status_history").insert({
    user_id: user.id,
    application_id: data.id,
    from_status: null,
    to_status: initialStatus,
    note: "Application created",
  });

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "application",
    entity_id: data.id,
    action: "created",
    summary: `Created application`,
  });

  redirect(`/applications/${data.id}`);
}

// ============================================================
// DEADLINE FORM ACTIONS
// ============================================================

export async function createDeadlineFromForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const dueAt = formData.get("due_at") as string;
  if (!title || !dueAt) redirect("/calendar?error=Title+and+due+date+are+required");

  const { data, error } = await supabase
    .from("deadlines")
    .insert({
      user_id: user.id,
      title,
      deadline_type: (formData.get("deadline_type") as string) || "custom",
      due_at: dueAt,
      timezone: (formData.get("timezone") as string) || "Africa/Accra",
      is_date_only: formData.get("is_date_only") === "on",
      source_url: formData.get("source_url") as string || null,
      is_hard_deadline: formData.get("is_hard_deadline") !== "off",
      application_id: formData.get("application_id") as string || null,
      program_id: formData.get("program_id") as string || null,
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/calendar?error=" + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "deadline",
    entity_id: data.id,
    action: "created",
    summary: `Created deadline: ${title}`,
  });

  redirect("/calendar");
}
