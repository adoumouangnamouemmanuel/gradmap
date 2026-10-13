"use server";

import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/server";
import { createEntryFromForm } from "@/features/entries/actions";

// ============================================================
// SCHOLARSHIP DEADLINE FORM ACTION
// ============================================================

export async function createScholarshipDeadlineFromForm(formData: FormData) {
  const result = await createEntryFromForm("deadline", formData);
  if (result.error) redirect("/scholarships?error=" + encodeURIComponent(result.error));
  redirect("/scholarships");
}

// ============================================================
// SCHOLARSHIP TASK FORM ACTION
// ============================================================

export async function createScholarshipTaskFromForm(formData: FormData) {
  const result = await createEntryFromForm("task", formData);
  if (result.error) redirect("/scholarships?error=" + encodeURIComponent(result.error));
  redirect("/scholarships");
}

// ============================================================
// SCHOLARSHIP FORM ACTIONS
// ============================================================

export async function createScholarshipWithPrograms(formData: FormData) {
  return createEntryFromForm("scholarship", formData);
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
  const result = await createEntryFromForm("scholarshipApplication", formData);
  if (result.error) redirect("/scholarships?error=" + encodeURIComponent(result.error));
  redirect("/scholarships");
}
