"use server";
import type { ApplicationPage } from "./workspace";
import { z } from "zod";

import { guardEntry } from "@/features/entries/relationships";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES } from "@/lib/constants";

// Helper to get authenticated user
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ============================================================
// INSTITUTIONS
// ============================================================

export async function getInstitutions() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .is("archived_at", null)
    .order("name");

  if (error) {
    console.error("Error fetching institutions:", error.message);
    return [];
  }
  return data || [];
}

export async function getInstitution(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("institutions").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

// ============================================================
// PROGRAMS
// ============================================================

export async function getPrograms(institutionId?: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  let query = supabase
    .from("programs")
    .select("*, institutions!programs_institution_id_fkey(name, country_name, city)")
    .is("archived_at", null)
    .order("display_priority", { ascending: false });

  if (institutionId) {
    query = query.eq("institution_id", institutionId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching programs:", error.message);
    return [];
  }
  return data || [];
}

export async function getProgram(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("programs")
    .select("*, institutions!programs_institution_id_fkey(name, country_name, city, website_url)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProgram(formData: {
  institution_id: string;
  name: string;
  degree_type?: string;
  department?: string;
  field?: string;
  intake_term?: string;
  intake_year?: number;
  duration_months?: number;
  delivery_mode?: string;
  program_url?: string;
  application_portal_url?: string;
  status?: string;
  display_priority?: number;
  requirements_summary?: string;
  research_notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("program", formData, supabase, user.id);

  const { data, error } = await supabase
    .from("programs")
    .insert({
      user_id: user.id,
      institution_id: formData.institution_id,
      name: formData.name,
      degree_type: formData.degree_type || null,
      department: formData.department || null,
      field: formData.field || null,
      intake_term: formData.intake_term || null,
      intake_year: formData.intake_year || 2027,
      duration_months: formData.duration_months || null,
      delivery_mode: formData.delivery_mode || null,
      program_url: formData.program_url || null,
      application_portal_url: formData.application_portal_url || null,
      status: formData.status || "exploring",
      display_priority: formData.display_priority || 3,
      requirements_summary: formData.requirements_summary || null,
      research_notes: formData.research_notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "program",
    entity_id: data.id,
    action: "created",
    summary: `Created program: ${formData.name}`,
  });

  revalidatePath("/programs");
  return data;
}

export async function updateProgram(
  id: string,
  formData: Partial<{
    name: string;
    degree_type: string;
    department: string;
    field: string;
    intake_term: string;
    intake_year: number;
    duration_months: number;
    delivery_mode: string;
    program_url: string;
    application_portal_url: string;
    status: string;
    display_priority: number;
    requirements_summary: string;
    research_notes: string;
  }>,
) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("programs")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/programs");
  revalidatePath(`/programs/${id}`);
  return data;
}

export async function archiveProgram(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("programs")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/programs");
}

export async function updateInstitution(
  id: string,
  formData: Partial<{
    name: string;
    country_name: string;
    city: string;
    website_url: string;
    notes: string;
  }>,
) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("institutions")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/institutions");
  revalidatePath(`/institutions/${id}`);
  return data;
}

export async function archiveInstitution(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("institutions")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/institutions");
}

// ============================================================
// APPLICATIONS
// ============================================================

export async function getApplications() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      "*, programs!applications_program_id_fkey(name, institutions!programs_institution_id_fkey(name, country_name))",
    )
    .is("archived_at", null)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error.message);
    return [];
  }
  return data || [];
}

export async function getApplication(id: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      programs!applications_program_id_fkey(
        name, degree_type, field, institution_id,
        institutions!programs_institution_id_fkey(name, country_name, city)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createApplication(formData: {
  institution_id?: string;
  program_id: string;
  status?: string;
  priority?: number;
  application_round?: string;
  portal_url?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("application", formData, supabase, user.id);

  const initialStatus = formData.status || "researching";

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      program_id: formData.program_id,
      status: initialStatus,
      priority: formData.priority || 3,
      application_round: formData.application_round || null,
      portal_url: formData.portal_url || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

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

  revalidatePath("/applications");
  return data;
}

export async function updateApplicationStatus(id: string, newStatus: string, note?: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: current } = await supabase
    .from("applications")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from("application_status_history").insert({
    user_id: user.id,
    application_id: id,
    from_status: current?.status || null,
    to_status: newStatus,
    note: note || null,
  });

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "application",
    entity_id: id,
    action: "status_changed",
    summary: `Status changed to ${newStatus}`,
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  return data;
}

export async function updateApplicationStatusFromForm(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
    throw new Error("Invalid application status");
  }
  return updateApplicationStatus(id, status);
}

export async function archiveApplication(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase
    .from("applications")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/applications");
}

// ============================================================
// DEADLINES
// ============================================================

export async function getUpcomingDeadlines(days: number = 30) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const now = new Date();
  const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Fetch all unarchived, uncompleted deadlines within range.
  // Also fetch without date filter as fallback if the column has non-ISO values.
  let { data, error } = await supabase
    .from("deadlines")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .is("completed_at", null)
    .gte("due_at", past.toISOString())
    .lte("due_at", future.toISOString())
    .order("due_at");

  if (error) {
    console.error("Error fetching deadlines:", error.message);
    return [];
  }

  // If no results with date filter, try without it (handles malformed due_at values)
  if ((!data || data.length === 0) && days >= 30) {
    const fallback = await supabase
      .from("deadlines")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .is("completed_at", null)
      .order("due_at")
      .limit(50);

    if (!fallback.error && fallback.data && fallback.data.length > 0) {
      data = fallback.data;
    }
  }

  return data || [];
}

export async function completeDeadline(id: string) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("deadlines")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/calendar");
  return data;
}

export async function deleteDeadline(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("deadlines").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

// ============================================================
// TASKS
// ============================================================

export async function getTasks(applicationId?: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  let query = supabase
    .from("tasks")
    .select("id, title, status, due_at, application_id, blocking")
    .is("archived_at", null)
    .order("due_at", { ascending: true });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching tasks:", error.message);
    return [];
  }
  return data || [];
}

export async function getBlockingTasks() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, due_at, application_id, blocking")
    .is("archived_at", null)
    .eq("blocking", true)
    .not("status", "in", "(done,cancelled)")
    .order("due_at", { ascending: true });

  if (error) {
    console.error("Error fetching blocking tasks:", error.message);
    return [];
  }
  return data || [];
}

export async function updateTaskStatus(id: string, status: string) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/calendar");
  return data;
}

export async function createTask(formData: {
  program_id?: string;
  scholarship_application_id?: string;
  document_id?: string;
  essay_prompt_id?: string;
  recommendation_request_id?: string;
  timezone?: string;
  title: string;
  application_id?: string;
  scholarship_id?: string;
  description?: string;
  due_at?: string;
  priority?: number;
  blocking?: boolean;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("task", formData, supabase, user.id);

  let isoDueAt: string | null = null;
  if (formData.due_at) {
    const formatted = formData.due_at.length === 16 ? formData.due_at + ":00" : formData.due_at;
    isoDueAt = new Date(formatted).toISOString();
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: formData.title,
      program_id: formData.program_id || null,
      scholarship_application_id: formData.scholarship_application_id || null,
      document_id: formData.document_id || null,
      essay_prompt_id: formData.essay_prompt_id || null,
      recommendation_request_id: formData.recommendation_request_id || null,
      description: formData.description || null,
      status: "todo",
      priority: formData.priority || 3,
      due_at: isoDueAt,
      application_id: formData.application_id || null,
      scholarship_id: formData.scholarship_id || null,
      blocking: formData.blocking || false,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "task",
    entity_id: data.id,
    action: "created",
    summary: `Created task: ${formData.title}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return data;
}

export async function createDeadline(formData: {
  timezone?: string;
  scholarship_application_id?: string;
  title: string;
  application_id?: string;
  scholarship_id?: string;
  program_id?: string;
  deadline_type?: string;
  due_at: string;
  source_url?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");
  await guardEntry("deadline", formData, supabase, user.id);

  const formatted = formData.due_at.length === 16 ? formData.due_at + ":00" : formData.due_at;
  const isoDueAt = new Date(formatted).toISOString();

  const { data, error } = await supabase
    .from("deadlines")
    .insert({
      user_id: user.id,
      title: formData.title,
      deadline_type: formData.deadline_type || "other",
      due_at: isoDueAt,
      timezone: formData.timezone || "Africa/Accra",
      scholarship_application_id: formData.scholarship_application_id || null,
      source_url: formData.source_url || null,
      application_id: formData.application_id || null,
      scholarship_id: formData.scholarship_id || null,
      program_id: formData.program_id || null,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activity_events").insert({
    user_id: user.id,
    entity_type: "deadline",
    entity_id: data.id,
    action: "created",
    summary: `Created deadline: ${formData.title}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return data;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const { supabase, user } = await getUser();
  if (!user) {
    return {
      totalPrograms: 0,
      totalApplications: 0,
      statusCounts: {},
      upcomingDeadlines: [],
      pendingTasks: [],
      blockingTasks: [],
    };
  }

  const [programsRes, applicationsRes, deadlinesRes, tasksRes] = await Promise.all([
    supabase.from("programs").select("id, status", { count: "exact" }).is("archived_at", null),
    supabase
      .from("applications")
      .select("id, status, priority", { count: "exact" })
      .is("archived_at", null),
    supabase
      .from("deadlines")
      .select("*")
      .is("archived_at", null)
      .is("completed_at", null)
      .gte("due_at", new Date().toISOString())
      .order("due_at")
      .limit(10),
    supabase
      .from("tasks")
      .select("*")
      .is("archived_at", null)
      .not("status", "in", "(done,cancelled)")
      .order("due_at", { ascending: true })
      .limit(5),
  ]);

  const applications = applicationsRes.data || [];
  const statusCounts: Record<string, number> = {};
  for (const app of applications) {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  }

  return {
    totalPrograms: programsRes.count || 0,
    totalApplications: applicationsRes.count || 0,
    statusCounts,
    upcomingDeadlines: deadlinesRes.data || [],
    pendingTasks: tasksRes.data || [],
    blockingTasks: tasksRes.data?.filter((t) => t.blocking) || [],
  };
}

// ============================================================
// PROGRAM EVALUATIONS
// ============================================================

export async function getProgramEvaluation(programId: string) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("program_evaluations")
    .select("*")
    .eq("program_id", programId)
    .single();

  if (error && error.code !== "PGRST116") return null;
  return data;
}

export async function getApplicationPage(
  options: { query?: string; status?: string; page?: number } = {},
): Promise<ApplicationPage> {
  const input = z
    .object({
      query: z.string().trim().max(120).default(""),
      status: z.string().max(60).default("all"),
      page: z.number().int().min(1).max(10000).default(1),
    })
    .parse(options);
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Please sign in again.");
  const { data, error } = await supabase.rpc("get_application_page", {
    p_query: input.query,
    p_status: input.status,
    p_page: input.page,
  });
  if (error) throw new Error("Applications couldn’t load. Please retry.");
  return z
    .object({
      items: z
        .array(
          z.object({
            id: z.string().uuid(),
            status: z.string(),
            priority: z.number(),
            programs: z
              .object({
                name: z.string(),
                institutions: z
                  .object({ name: z.string(), country_name: z.string().nullable() })
                  .nullable(),
              })
              .nullable(),
          }),
        )
        .max(24),
      page: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      pageSize: z.literal(24),
      stages: z.array(z.string()),
    })
    .parse(data);
}
