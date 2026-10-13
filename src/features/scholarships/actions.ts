"use server";

import { guardEntry } from "@/features/entries/relationships";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ELIGIBILITY_STATUSES, SCHOLARSHIP_STATUSES } from "@/lib/constants";

// Helper to get authenticated user
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ============================================================
// SCHOLARSHIPS
// ============================================================

export async function getScholarships() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scholarships")
    .select("*")
    .is("archived_at", null)
    .order("display_priority", { ascending: false });

  if (error) {
    console.error("Error fetching scholarships:", error.message);
    return [];
  }
  return data || [];
}

export async function getScholarship(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("scholarships").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function createScholarship(formData: {
  name: string;
  provider?: string;
  official_url?: string;
  funding_type?: string;
  amount?: number;
  currency_code?: string;
  coverage_notes?: string;
  application_mechanism?: string;
  eligibility_status?: string;
  eligibility_notes?: string;
  service_obligation_notes?: string;
  display_priority?: number;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("scholarships")
    .insert({
      user_id: user.id,
      name: formData.name,
      provider: formData.provider || null,
      official_url: formData.official_url || null,
      funding_type: formData.funding_type || "unknown",
      amount: formData.amount || null,
      currency_code: formData.currency_code || null,
      coverage_notes: formData.coverage_notes || null,
      application_mechanism: formData.application_mechanism || "unknown",
      eligibility_status: formData.eligibility_status || "unknown",
      eligibility_notes: formData.eligibility_notes || null,
      service_obligation_notes: formData.service_obligation_notes || null,
      display_priority: formData.display_priority || 3,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "scholarship",
    entity_id: data.id,
    action: "created",
    summary: `Created scholarship: ${formData.name}`,
  });

  revalidatePath("/scholarships");
  return data;
}

export async function updateScholarship(
  id: string,
  formData: Partial<{
    name: string;
    provider: string;
    official_url: string;
    funding_type: string;
    amount: number;
    currency_code: string;
    coverage_notes: string;
    application_mechanism: string;
    eligibility_status: string;
    eligibility_notes: string;
    service_obligation_notes: string;
    display_priority: number;
  }>,
) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("scholarships")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/scholarships");
  revalidatePath(`/scholarships/${id}`);
  return data;
}

export async function updateScholarshipEligibilityFromForm(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!ELIGIBILITY_STATUSES.includes(status as (typeof ELIGIBILITY_STATUSES)[number])) {
    throw new Error("Invalid scholarship eligibility status");
  }
  return updateScholarship(id, { eligibility_status: status });
}

export async function archiveScholarship(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("scholarships")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/scholarships");
}

// ============================================================
// PROGRAM SCHOLARSHIPS (junction)
// ============================================================

export async function getProgramScholarships(scholarshipId: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("program_scholarships")
    .select(
      "*, programs!program_scholarships_program_owner_fkey(name, institution_id, institutions!programs_institution_id_fkey(name))",
    )
    .eq("scholarship_id", scholarshipId)
    .order("created_at");

  if (error) {
    console.error("Error fetching program scholarships:", error.message);
    return [];
  }
  return data || [];
}

export async function linkScholarshipToProgram(
  scholarshipId: string,
  programId: string,
  compatibilityStatus: string = "needs_verification",
  notes?: string,
) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("program_scholarships")
    .insert({
      user_id: user.id,
      program_id: programId,
      scholarship_id: scholarshipId,
      compatibility_status: compatibilityStatus,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/scholarships");
  revalidatePath("/programs");
  return data;
}

export async function removeScholarshipFromProgram(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("program_scholarships").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/scholarships");
  revalidatePath("/programs");
}

// ============================================================
// SCHOLARSHIP APPLICATIONS
// ============================================================

export async function getScholarshipApplications() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scholarship_applications")
    .select(
      "*, scholarships!scholarship_applications_scholarship_owner_fkey(name, provider, funding_type, amount, currency_code)",
    )
    .is("archived_at", null)
    .order("created_at");

  if (error) {
    console.error("Error fetching scholarship applications:", error.message);
    return [];
  }
  return data || [];
}

export async function getScholarshipApplication(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("scholarship_applications")
    .select(
      "*, scholarships!scholarship_applications_scholarship_owner_fkey(name, provider, funding_type, amount, currency_code, coverage_notes, application_mechanism)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createScholarshipApplication(formData: {
  scholarship_id: string;
  application_id?: string;
  status?: string;
  nomination_required?: boolean;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("scholarshipApplication", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("scholarship_applications")
    .insert({
      user_id: user.id,
      scholarship_id: formData.scholarship_id,
      application_id: formData.application_id || null,
      status: formData.status || "researching",
      nomination_required: formData.nomination_required || false,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "scholarship_application",
    entity_id: data.id,
    action: "created",
    summary: `Created scholarship application`,
  });

  revalidatePath("/scholarships");
  revalidatePath("/applications");
  return data;
}

export async function updateScholarshipApplicationStatus(
  id: string,
  newStatus: string,
  note?: string,
) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: current } = await supabase
    .from("scholarship_applications")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("scholarship_applications")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "scholarship_application",
    entity_id: id,
    action: "status_changed",
    summary: `Scholarship application status changed to ${newStatus}`,
  });

  revalidatePath("/scholarships");
  revalidatePath(`/scholarships/${id}`);
  return data;
}

export async function updateScholarshipApplicationStatusFromForm(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!SCHOLARSHIP_STATUSES.includes(status as (typeof SCHOLARSHIP_STATUSES)[number])) {
    throw new Error("Invalid scholarship application status");
  }
  return updateScholarshipApplicationStatus(id, status);
}

export async function archiveScholarshipApplication(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("scholarship_applications")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/scholarships");
}

// ============================================================
// EXPENSES
// ============================================================

export async function getExpenses() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .is("archived_at", null)
    .order("due_on", { ascending: true });

  if (error) {
    console.error("Error fetching expenses:", error.message);
    return [];
  }
  return data || [];
}

export async function getExpense(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function createExpense(formData: {
  application_id?: string;
  scholarship_application_id?: string;
  category: string;
  description: string;
  amount: number;
  currency_code: string;
  status?: string;
  due_on?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      application_id: formData.application_id || null,
      scholarship_application_id: formData.scholarship_application_id || null,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      currency_code: formData.currency_code,
      status: formData.status || "planned",
      due_on: formData.due_on || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/applications");
  revalidatePath("/expenses");
  return data;
}

export async function updateExpenseStatus(id: string, status: string) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("expenses")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/applications");
  revalidatePath("/expenses");
  return data;
}

export async function archiveExpense(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("expenses")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/applications");
  revalidatePath("/expenses");
}

// ============================================================
// FUNDING SUMMARY
// ============================================================

export async function getFundingSummary() {
  const { supabase, user } = await getUser();
  if (!user) return { scholarships: [], expenses: [], totalExpenses: 0 };

  const [scholarshipsRes, expensesRes] = await Promise.all([
    supabase
      .from("scholarships")
      .select("id, name, funding_type, amount, currency_code, eligibility_status")
      .is("archived_at", null)
      .order("display_priority", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, description, amount, currency_code, status, category")
      .is("archived_at", null)
      .order("due_on", { ascending: true }),
  ]);

  const expenses = expensesRes.data || [];
  const totalExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return {
    scholarships: scholarshipsRes.data || [],
    expenses,
    totalExpenses,
  };
}
