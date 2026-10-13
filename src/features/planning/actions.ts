"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createActionClient, createClient } from "@/lib/supabase/server";
import { monthDays } from "./dates";
import type { PlanningData, PlanningItem } from "./types";
const recommenderLabelSchema = z.object({ name: z.string() });

export async function getPlanningData(month: string): Promise<PlanningData> {
  z.string()
    .regex(/^(20[2-4]\d|2050)-(0[1-9]|1[0-2])$/)
    .parse(month);
  const days = monthDays(month);
  const start = new Date(Date.parse(`${days[0]}T00:00:00Z`) - 86400000).toISOString();
  const end = new Date(Date.parse(`${days[41]}T00:00:00Z`) + 172800000).toISOString();
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const [deadlines, tasks, requests, requirements, undated] = await Promise.all([
    client
      .from("deadlines")
      .select(
        "id,title,due_at,application_id,program_id,scholarship_id,scholarship_application_id,completed_at",
      )
      .eq("user_id", user.id)
      .is("archived_at", null)
      .gte("due_at", start)
      .lt("due_at", end)
      .order("due_at")
      .limit(501),
    client
      .from("tasks")
      .select(
        "id,title,due_at,application_id,program_id,scholarship_id,scholarship_application_id,document_id,essay_prompt_id,recommendation_request_id,status",
      )
      .eq("user_id", user.id)
      .is("archived_at", null)
      .gte("due_at", start)
      .lt("due_at", end)
      .order("due_at")
      .limit(501),
    client
      .from("recommendation_requests")
      .select("id,recommender_id,due_at,application_id,scholarship_application_id,status,recommender:recommenders!recommendation_requests_recommender_owner_fkey(name)")
      .eq("user_id", user.id)
      .gte("due_at", start)
      .lt("due_at", end)
      .order("due_at")
      .limit(501),
    client
      .from("document_requirements")
      .select(
        "id,requirement_name,due_at,application_id,scholarship_application_id,satisfied_by_version_id",
      )
      .eq("user_id", user.id)
      .gte("due_at", start)
      .lt("due_at", end)
      .order("due_at")
      .limit(501),
    client
      .from("tasks")
      .select(
        "id,title,due_at,application_id,program_id,scholarship_id,scholarship_application_id,document_id,essay_prompt_id,recommendation_request_id,status",
      )
      .eq("user_id", user.id)
      .is("archived_at", null)
      .is("due_at", null)
      .order("created_at", { ascending: false })
      .limit(101),
  ]);
  if ([deadlines, tasks, requests, requirements, undated].some((result) => result.error))
    throw new Error("We couldn’t load the calendar. Check your connection and try again.");
  const taskRows = [...(tasks.data || []), ...(undated.data || [])];
  const essayIds = [...new Set(taskRows.map((row) => row.essay_prompt_id).filter(Boolean))];
  const requestIds = [
    ...new Set(taskRows.map((row) => row.recommendation_request_id).filter(Boolean)),
  ];
  const [writing, followups] = await Promise.all([
    essayIds.length
      ? client
          .from("essay_prompts")
          .select("id,application_id")
          .eq("user_id", user.id)
          .in("id", essayIds)
          .limit(602)
      : Promise.resolve({ data: [], error: null }),
    requestIds.length
      ? client
          .from("recommendation_requests")
          .select("id,application_id,recommender_id")
          .eq("user_id", user.id)
          .in("id", requestIds)
          .limit(602)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (writing.error || followups.error)
    throw new Error("Linked preparation couldn’t load. Please retry.");
  const writingParents = new Map((writing.data || []).map((row) => [row.id, row.application_id]));
  const requestParents = new Map((followups.data || []).map((row) => [row.id, row.application_id]));
  const requestPeople = new Map((followups.data || []).map((row) => [row.id, row.recommender_id]));
  const items: PlanningItem[] = [];
  for (const row of deadlines.data || [])
    items.push({
      id: row.id,
      kind: "deadline",
      title: row.title,
      dueAt: row.due_at,
      applicationId: row.application_id,
      context: row.program_id
        ? "Program research"
        : row.scholarship_id
          ? "Scholarship research"
          : row.scholarship_application_id
            ? "Scholarship application"
            : "General deadline",
      href: row.application_id
        ? `/applications/${row.application_id}#deadlines`
        : row.program_id
          ? `/programs/${row.program_id}`
          : row.scholarship_id
            ? `/scholarships/${row.scholarship_id}`
            : null,
      completed: !!row.completed_at,
      status: row.completed_at ? "Complete" : "Due",
    });
  for (const row of taskRows)
    items.push({
      id: row.id,
      kind: "task",
      title: row.title,
      dueAt: row.due_at,
      applicationId:
        row.application_id ||
        writingParents.get(row.essay_prompt_id) ||
        requestParents.get(row.recommendation_request_id) ||
        null,
      context: row.document_id
        ? "Document preparation"
        : row.essay_prompt_id
          ? "Writing preparation"
          : row.recommendation_request_id
            ? "Recommendation follow-up"
            : row.program_id
              ? "Program research"
              : row.scholarship_id
                ? "Scholarship research"
                : "General task",
      href: row.application_id
        ? `/applications/${row.application_id}#tasks`
        : row.program_id
          ? `/programs/${row.program_id}`
          : row.scholarship_id
            ? `/scholarships/${row.scholarship_id}`
            : row.document_id
              ? `/documents/${row.document_id}`
              : row.essay_prompt_id
                ? `/essays/${row.essay_prompt_id}`
                : row.recommendation_request_id
                  ? `/recommenders/${requestPeople.get(row.recommendation_request_id) || ""}`
                  : null,
      completed: ["done", "cancelled"].includes(row.status),
      status: row.status.replaceAll("_", " "),
    });
  for (const row of requests.data || []) {
    const person = recommenderLabelSchema.safeParse(row.recommender);
    items.push({
      id: row.id,
      kind: "recommendation",
      title: person.success ? `${person.data.name} · Recommendation` : "Recommendation letter",
      dueAt: row.due_at,
      applicationId: row.application_id,
      context: "Recommendation request",
      href: `/recommenders/${row.recommender_id}`,
      completed: ["submitted", "declined"].includes(row.status),
      status: row.status,
    });
  }
  for (const row of requirements.data || [])
    items.push({
      id: row.id,
      kind: "document",
      title: row.requirement_name,
      dueAt: row.due_at,
      applicationId: row.application_id,
      context: "Document requirement",
      href: row.application_id ? `/applications/${row.application_id}#documents` : "/documents",
      completed: !!row.satisfied_by_version_id,
      status: row.satisfied_by_version_id ? "Ready" : "Missing",
    });
  return {
    items,
    truncated:
      [deadlines, tasks, requests, requirements].some(
        (result) => (result.data?.length || 0) > 500,
      ) || (undated.data?.length || 0) > 100,
  };
}

export async function setPlanningComplete(
  kind: "deadline" | "task",
  id: string,
  completed: boolean,
): Promise<{ error?: string }> {
  const parsed = z
    .object({ kind: z.enum(["deadline", "task"]), id: z.string().uuid(), completed: z.boolean() })
    .safeParse({ kind, id, completed });
  if (!parsed.success) return { error: "This calendar action is unavailable." };
  const client = await createActionClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: "Please sign in again." };
  const { error, data } = await client
    .from(kind === "task" ? "tasks" : "deadlines")
    .update(
      kind === "task"
        ? {
            status: completed ? "done" : "todo",
            completed_at: completed ? new Date().toISOString() : null,
          }
        : { completed_at: completed ? new Date().toISOString() : null },
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .select("id")
    .single();
  if (error || !data)
    return { error: "We couldn’t update this item. It may have changed; reload and try again." };
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/applications", "layout");
  return {};
}
