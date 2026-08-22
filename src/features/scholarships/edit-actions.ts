"use server";

import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/server";

// ============================================================
// SCHOLARSHIP EDIT FORM ACTION
// ============================================================

export async function updateScholarshipFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) redirect("/scholarships?error=Missing+scholarship+id");

  const name = formData.get("name") as string;
  if (!name) redirect(`/scholarships/${id}/edit?error=Name+is+required`);

  const { error } = await supabase
    .from("scholarships")
    .update({
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
    .eq("id", id);

  if (error) redirect(`/scholarships/${id}/edit?error=` + encodeURIComponent(error.message));

  // Update program links: delete existing, insert new
  const programIds = formData.getAll("program_ids") as string[];

  // Delete existing links
  await supabase
    .from("program_scholarships")
    .delete()
    .eq("scholarship_id", id);

  // Insert new links
  if (programIds.length > 0) {
    const links = programIds.map((programId) => ({
      user_id: user.id,
      program_id: programId,
      scholarship_id: id,
      compatibility_status: "needs_verification" as const,
    }));

    await supabase.from("program_scholarships").insert(links);
  }

  redirect(`/scholarships/${id}`);
}

// ============================================================
// EXPENSE EDIT FORM ACTION
// ============================================================

export async function updateExpenseFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) redirect("/applications?error=Missing+expense+id");

  const { error } = await supabase
    .from("expenses")
    .update({
      description: formData.get("description") as string,
      category: (formData.get("category") as string) || "other",
      amount: Number(formData.get("amount")),
      currency_code: formData.get("currency_code") as string,
      status: (formData.get("status") as string) || "planned",
      due_on: formData.get("due_on") as string || null,
      paid_at: formData.get("status") === "paid" ? new Date().toISOString() : null,
      notes: formData.get("notes") as string || null,
    })
    .eq("id", id);

  if (error) redirect("/applications?error=" + encodeURIComponent(error.message));

  const applicationId = formData.get("application_id") as string;
  redirect(applicationId ? `/applications/${applicationId}` : "/applications");
}

// ============================================================
// EXPENSE ARCHIVE
// ============================================================

export async function archiveExpenseFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const applicationId = formData.get("application_id") as string;
  if (!id) redirect("/applications?error=Missing+expense+id");

  const { error } = await supabase
    .from("expenses")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) redirect("/applications?error=" + encodeURIComponent(error.message));

  redirect(applicationId ? `/applications/${applicationId}` : "/applications");
}

// ============================================================
// SCHOLARSHIP ARCHIVE
// ============================================================

export async function archiveScholarshipFromForm(formData: FormData) {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) redirect("/scholarships?error=Missing+scholarship+id");

  const { error } = await supabase
    .from("scholarships")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) redirect("/scholarships?error=" + encodeURIComponent(error.message));

  redirect("/scholarships");
}
