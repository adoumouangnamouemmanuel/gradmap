"use server";
import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/entries/schemas";
import type { FormResult } from "@/components/domain/create-page";

export async function saveProfile(form: FormData): Promise<FormResult> {
  const client = await createActionClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: "Please sign in again before saving." };
  const raw = Object.fromEntries(form);
  const parsed = profileSchema.safeParse({
    ...raw,
    preferred_countries: form.getAll("preferred_countries"),
    target_degrees: form.getAll("target_degrees"),
    delivery_preferences: form.getAll("delivery_preferences"),
    research_interests: String(form.get("research_interests") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    preferred_languages: String(form.get("preferred_languages") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
  if (!parsed.success)
    return {
      error: "Review your profile details.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      ),
    };
  const { data: existing, error: readError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (readError || !existing)
    return { error: "Your profile is unavailable. Please reload and try again." };
  const extended = Object.hasOwn(existing, "field_of_study") && form.has("field_of_study");
  const { full_name, timezone, target_intake_year } = parsed.data;
  const payload = extended
    ? {
        ...parsed.data,
        field_of_study: parsed.data.field_of_study ?? null,
        current_qualification: parsed.data.current_qualification ?? null,
        academic_institution: parsed.data.academic_institution ?? null,
        career_goal: parsed.data.career_goal ?? null,
        annual_tuition_budget: parsed.data.annual_tuition_budget ?? null,
      }
    : { full_name, timezone, target_intake_year };
  const { error, data } = await client
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select("id")
    .single();
  if (error || !data)
    return {
      error: "We couldn’t save your profile. Your changes are still here; please try again.",
    };
  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
