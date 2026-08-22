"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Helper to get authenticated user
async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", id)
    .single();

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
    .select("*, institutions!inner(name, country_name, city)")
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
    .select("*, institutions!inner(name, country_name, city, website_url)")
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

// ============================================================
// APPLICATIONS
// ============================================================

export async function getApplications() {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("*, programs!inner(name, institutions!inner(name, country_name))")
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
    .select(`
      *,
      programs!inner(
        name, degree_type, field, institution_id,
        institutions!inner(name, country_name, city)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createApplication(formData: {
  program_id: string;
  status?: string;
  priority?: number;
  application_round?: string;
  portal_url?: string;
  notes?: string;
}) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Not authenticated");

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

export async function updateApplicationStatus(
  id: string,
  newStatus: string,
  note?: string,
) {
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

// ============================================================
// DEADLINES
// ============================================================

export async function getUpcomingDeadlines(days: number = 30) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("deadlines")
    .select("*")
    .is("archived_at", null)
    .is("completed_at", null)
    .gte("due_at", now.toISOString())
    .lte("due_at", future.toISOString())
    .order("due_at");

  if (error) {
    console.error("Error fetching deadlines:", error.message);
    return [];
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

// ============================================================
// TASKS
// ============================================================

export async function getTasks(applicationId?: string) {
  const { supabase, user } = await getUser();
  if (!user) return [];

  let query = supabase
    .from("tasks")
    .select("*")
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
    .select("*")
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
    supabase
      .from("programs")
      .select("id, status", { count: "exact" })
      .is("archived_at", null),
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
