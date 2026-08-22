"use server";

import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/server";

// ============================================================
// SCHOLARSHIP DEADLINE FORM ACTION
// ============================================================

export async function createScholarshipDeadlineFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const dueAt = formData.get("due_at") as string;
  const scholarshipId = formData.get("scholarship_id") as string;
  if (!title || !dueAt || !scholarshipId) redirect(`/scholarships/${scholarshipId}?error=Title+and+due+date+are+required`);

  const { data: deadlineData, error } = await supabase
    .from("deadlines")
    .insert({
      user_id: user.id,
      title,
      deadline_type: (formData.get("deadline_type") as string) || "funding",
      due_at: dueAt,
      timezone: (formData.get("timezone") as string) || "Africa/Accra",
      is_date_only: formData.get("is_date_only") === "on",
      source_url: formData.get("source_url") as string || null,
      is_hard_deadline: formData.get("is_hard_deadline") !== "off",
      scholarship_id: scholarshipId,
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect(`/scholarships/${scholarshipId}?error=` + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "deadline",
    entity_id: deadlineData?.id,
    action: "created",
    summary: `Created scholarship deadline: ${title}`,
  });

  redirect(`/scholarships/${scholarshipId}`);
}

// ============================================================
// SCHOLARSHIP TASK FORM ACTION
// ============================================================

export async function createScholarshipTaskFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const scholarshipId = formData.get("scholarship_id") as string;
  if (!title || !scholarshipId) redirect(`/scholarships/${scholarshipId}?error=Title+is+required`);

  const { data: taskData, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title,
      description: formData.get("description") as string || null,
      status: "todo",
      priority: Number(formData.get("priority")) || 3,
      due_at: formData.get("due_at") as string || null,
      scholarship_id: scholarshipId,
      blocking: formData.get("blocking") === "on",
    })
    .select()
    .single();

  if (error) redirect(`/scholarships/${scholarshipId}?error=` + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "task",
    entity_id: taskData?.id,
    action: "created",
    summary: `Created scholarship task: ${title}`,
  });

  redirect(`/scholarships/${scholarshipId}`);
}

// ============================================================
// SCHOLARSHIP FORM ACTIONS
// ============================================================

export async function createScholarshipWithPrograms(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  if (!name) redirect("/scholarships/new?error=Name+is+required");

  // Create the scholarship
  const { data: scholarship, error } = await supabase
    .from("scholarships")
    .insert({
      user_id: user.id,
      name,
      provider: formData.get("provider") as string || null,
      official_url: formData.get("official_url") as string || null,
      funding_type: (formData.get("funding_type") as string) || "unknown",
      amount: Number(formData.get("amount")) || null,
      currency_code: formData.get("currency_code") as string || null,
      coverage_notes: formData.get("coverage_notes") as string || null,
      application_mechanism: (formData.get("application_mechanism") as string) || "unknown",
      eligibility_status: (formData.get("eligibility_status") as string) || "unknown",
      eligibility_notes: formData.get("eligibility_notes") as string || null,
      service_obligation_notes: formData.get("service_obligation_notes") as string || null,
      display_priority: Number(formData.get("display_priority")) || 3,
    })
    .select()
    .single();

  if (error) redirect("/scholarships/new?error=" + encodeURIComponent(error.message));

  // Link to selected programs
  const programIds = formData.getAll("program_ids") as string[];
  if (programIds.length > 0) {
    const links = programIds.map((programId) => ({
      user_id: user.id,
      program_id: programId,
      scholarship_id: scholarship.id,
      compatibility_status: "needs_verification" as const,
    }));

    const { error: linkError } = await supabase
      .from("program_scholarships")
      .insert(links);

    if (linkError) {
      console.error("Error linking scholarship to programs:", linkError.message);
    }
  }

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "scholarship",
    entity_id: scholarship.id,
    action: "created",
    summary: `Created scholarship: ${name}${programIds.length > 0 ? ` linked to ${programIds.length} program(s)` : ""}`,
  });

  redirect(`/scholarships/${scholarship.id}`);
}

// ============================================================
// EXPENSE FORM ACTIONS
// ============================================================

export async function createExpenseFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const description = formData.get("description") as string;
  const amount = Number(formData.get("amount"));
  const currencyCode = formData.get("currency_code") as string;
  if (!description || !amount || !currencyCode) {
    redirect("/applications?error=Description,+amount+and+currency+are+required");
  }

  const { error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      application_id: formData.get("application_id") as string || null,
      scholarship_application_id: formData.get("scholarship_application_id") as string || null,
      category: (formData.get("category") as string) || "other",
      description,
      amount,
      currency_code: currencyCode,
      status: (formData.get("status") as string) || "planned",
      due_on: formData.get("due_on") as string || null,
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/applications?error=" + encodeURIComponent(error.message));

  const applicationId = formData.get("application_id") as string;
  redirect(applicationId ? `/applications/${applicationId}` : "/applications");
}

// ============================================================
// SCHOLARSHIP APPLICATION FORM ACTIONS
// ============================================================

export async function createScholarshipApplicationFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scholarshipId = formData.get("scholarship_id") as string;
  if (!scholarshipId) redirect("/scholarships?error=Scholarship+is+required");

  const { data, error } = await supabase
    .from("scholarship_applications")
    .insert({
      user_id: user.id,
      scholarship_id: scholarshipId,
      application_id: formData.get("application_id") as string || null,
      status: (formData.get("status") as string) || "researching",
      nomination_required: formData.get("nomination_required") === "on",
      notes: formData.get("notes") as string || null,
    })
    .select()
    .single();

  if (error) redirect("/scholarships?error=" + encodeURIComponent(error.message));

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "scholarship_application",
    entity_id: data.id,
    action: "created",
    summary: `Created scholarship application`,
  });

  redirect(`/scholarships/${scholarshipId}`);
}
