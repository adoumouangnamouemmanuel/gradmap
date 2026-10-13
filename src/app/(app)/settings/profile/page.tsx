import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/entries/schemas";
import { ProfileForm } from "@/features/profile/profile-form";

export default async function ProfilePage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error || !data)
    return (
      <div className="workspace-page">
        <section className="workspace-panel p-8">
          <h1 className="text-2xl font-semibold">Your profile couldn’t load.</h1>
          <p role="alert" className="text-muted-foreground mt-3 text-sm">
            Reload this page to try again. No existing preferences have been replaced.
          </p>
        </section>
      </div>
    );
  const parsed = profileSchema.safeParse({
    ...data,
    annual_tuition_budget:
      data.annual_tuition_budget == null ? undefined : String(data.annual_tuition_budget),
  });
  if (!parsed.success)
    return (
      <div className="workspace-page">
        <section className="workspace-panel p-8">
          <h1 className="text-2xl font-semibold">Your profile needs attention.</h1>
          <p role="alert" className="text-muted-foreground mt-3 text-sm">
            Some saved preferences are not supported. Your information has been preserved; review
            the profile with your administrator before editing.
          </p>
        </section>
      </div>
    );
  return (
    <>
      <div className="workspace-page pb-0">
        <section className="focus-panel flex flex-wrap items-center justify-between gap-6 rounded-[28px] p-7">
          <div>
            <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold">
              {parsed.data.full_name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </div>
            <h2 className="text-2xl font-semibold">{parsed.data.full_name}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {user.email} · {parsed.data.target_intake_year} intake
            </p>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { label: "Countries", value: parsed.data.preferred_countries.length },
              { label: "Degree goals", value: parsed.data.target_degrees.length },
              { label: "Interests", value: parsed.data.research_interests.length },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-semibold">{item.value}</p>
                <p className="text-muted-foreground mt-2 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ProfileForm profile={parsed.data} preferencesReady={Object.hasOwn(data, "field_of_study")} />
    </>
  );
}
