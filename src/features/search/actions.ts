"use server";

import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "program" | "scholarship" | "institution" | "application" | "document" | "essay";
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const { supabase, user } = await getUser();
  if (!user) return [];

  const term = query.trim();
  const results: SearchResult[] = [];

  // Search programs
  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, institutions!programs_institution_id_fkey(name)")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .ilike("name", `%${term}%`)
    .limit(5);

  for (const p of programs || []) {
    results.push({
      id: p.id,
      title: p.name,
      subtitle: (p as any).institutions?.name || "Program",
      href: `/programs/${p.id}`,
      type: "program",
    });
  }

  // Search scholarships
  const { data: scholarships } = await supabase
    .from("scholarships")
    .select("id, name, provider")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .ilike("name", `%${term}%`)
    .limit(5);

  for (const s of scholarships || []) {
    results.push({
      id: s.id,
      title: s.name,
      subtitle: s.provider || "Scholarship",
      href: `/scholarships/${s.id}`,
      type: "scholarship",
    });
  }

  // Search institutions
  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name, country_name")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .ilike("name", `%${term}%`)
    .limit(5);

  for (const inst of institutions || []) {
    results.push({
      id: inst.id,
      title: inst.name,
      subtitle: inst.country_name || "Institution",
      href: `/institutions/${inst.id}`,
      type: "institution",
    });
  }

  // Search documents
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .ilike("name", `%${term}%`)
    .limit(3);

  for (const doc of documents || []) {
    results.push({
      id: doc.id,
      title: doc.name,
      subtitle: "Document",
      href: `/documents/${doc.id}`,
      type: "document",
    });
  }

  return results;
}
