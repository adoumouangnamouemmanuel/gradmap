"use server";

import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export type SearchType =
  | "program" | "scholarship" | "institution"
  | "application" | "document" | "essay"
  | "contact" | "recommender" | "task"
  | "deadline" | "expense";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: SearchType;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const { supabase, user } = await getUser();
  if (!user) return [];

  const term = query.trim();
  const results: SearchResult[] = [];

  // Search in parallel for speed
  const [
    programsRes,
    scholarshipsRes,
    institutionsRes,
    documentsRes,
    essaysRes,
    contactsRes,
    recommendersRes,
    applicationsRes,
    tasksRes,
    deadlinesRes,
    expensesRes,
  ] = await Promise.all([
    // Programs
    supabase
      .from("programs")
      .select("id, name, institutions!programs_institution_id_fkey(name)")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("name", `%${term}%`)
      .limit(4),

    // Scholarships
    supabase
      .from("scholarships")
      .select("id, name, provider")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .or(`name.ilike.%${term}%,provider.ilike.%${term}%`)
      .limit(4),

    // Institutions
    supabase
      .from("institutions")
      .select("id, name, country_name, city")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .or(`name.ilike.%${term}%,city.ilike.%${term}%`)
      .limit(4),

    // Documents
    supabase
      .from("documents")
      .select("id, name, document_type")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("name", `%${term}%`)
      .limit(3),

    // Essay prompts
    supabase
      .from("essay_prompts")
      .select("id, title, status")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("title", `%${term}%`)
      .limit(3),

    // Contacts
    supabase
      .from("contacts")
      .select("id, name, role, institution, email")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .or(`name.ilike.%${term}%,role.ilike.%${term}%,institution.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(3),

    // Recommenders
    supabase
      .from("recommenders")
      .select("id, name, title, institution, email")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .or(`name.ilike.%${term}%,title.ilike.%${term}%,institution.ilike.%${term}%`)
      .limit(3),

    // Applications (search via program name join)
    supabase
      .from("applications")
      .select("id, status, programs!applications_program_id_fkey(name)")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("status", `%${term}%`)
      .limit(3),

    // Tasks
    supabase
      .from("tasks")
      .select("id, title, status")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("title", `%${term}%`)
      .limit(3),

    // Deadlines
    supabase
      .from("deadlines")
      .select("id, title, deadline_type")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("title", `%${term}%`)
      .limit(3),

    // Expenses
    supabase
      .from("expenses")
      .select("id, description, category, currency_code, amount")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .ilike("description", `%${term}%`)
      .limit(3),
  ]);

  // Programs
  for (const p of programsRes.data || []) {
    results.push({
      id: p.id, title: p.name,
      subtitle: (p as any).institutions?.name || "Program",
      href: `/programs/${p.id}`, type: "program",
    });
  }

  // Scholarships
  for (const s of scholarshipsRes.data || []) {
    results.push({
      id: s.id, title: s.name,
      subtitle: s.provider || "Scholarship",
      href: `/scholarships/${s.id}`, type: "scholarship",
    });
  }

  // Institutions
  for (const inst of institutionsRes.data || []) {
    results.push({
      id: inst.id, title: inst.name,
      subtitle: [inst.country_name, inst.city].filter(Boolean).join(" · ") || "Institution",
      href: `/institutions/${inst.id}`, type: "institution",
    });
  }

  // Documents
  for (const doc of documentsRes.data || []) {
    results.push({
      id: doc.id, title: doc.name,
      subtitle: doc.document_type?.replace(/_/g, " ") || "Document",
      href: `/documents/${doc.id}`, type: "document",
    });
  }

  // Essays
  for (const e of essaysRes.data || []) {
    results.push({
      id: e.id, title: e.title,
      subtitle: e.status?.replace(/_/g, " ") || "Essay",
      href: `/essays/${e.id}`, type: "essay",
    });
  }

  // Contacts
  for (const c of contactsRes.data || []) {
    results.push({
      id: c.id, title: c.name,
      subtitle: [c.role, c.institution].filter(Boolean).join(" · ") || c.email || "Contact",
      href: `/contacts/${c.id}`, type: "contact",
    });
  }

  // Recommenders
  for (const r of recommendersRes.data || []) {
    results.push({
      id: r.id, title: r.name,
      subtitle: [r.title, r.institution].filter(Boolean).join(" · ") || "Recommender",
      href: `/recommenders/${r.id}`, type: "recommender",
    });
  }

  // Applications (also search by program name)
  const { data: appsByName } = await supabase
    .from("applications")
    .select("id, status, programs!applications_program_id_fkey(name, id)")
    .eq("user_id", user.id)
    .is("archived_at", null);

  for (const a of appsByName || []) {
    const progName = (a as any).programs?.name || "";
    if (progName.toLowerCase().includes(term.toLowerCase()) || a.status?.toLowerCase().includes(term.toLowerCase())) {
      if (!results.find(r => r.type === "application" && r.id === a.id)) {
        results.push({
          id: a.id,
          title: progName || "Application",
          subtitle: a.status?.replace(/_/g, " ") || "Application",
          href: `/applications/${a.id}`, type: "application",
        });
      }
    }
  }

  // Tasks
  for (const t of tasksRes.data || []) {
    results.push({
      id: t.id, title: t.title,
      subtitle: `Task · ${t.status?.replace(/_/g, " ")}`,
      href: "/calendar", type: "task",
    });
  }

  // Deadlines
  for (const d of deadlinesRes.data || []) {
    results.push({
      id: d.id, title: d.title,
      subtitle: `Deadline · ${d.deadline_type?.replace(/_/g, " ")}`,
      href: "/calendar", type: "deadline",
    });
  }

  // Expenses
  for (const e of expensesRes.data || []) {
    results.push({
      id: e.id, title: e.description,
      subtitle: `${e.currency_code} ${Number(e.amount).toLocaleString()} · ${e.category?.replace(/_/g, " ")}`,
      href: "/settings/profile", type: "expense",
    });
  }

  return results;
}
