import { getEntryChoices } from "@/features/entries/actions";
import { EntryRetry } from "@/features/entries/retry";
import { getMaterialWorkspace } from "@/features/documents/workspace-actions";
import { MaterialsWorkspace } from "@/features/documents/materials-workspace";
import type { EntrySearch } from "@/features/entries/new-entry";
import { parsePage } from "@/lib/pagination";
export default async function Page({ searchParams }: { searchParams: Promise<EntrySearch> }) {
  const search = await searchParams;
  const tab = search.tab === "requirements" || search.tab === "requests" ? "secondary" : "primary";
  const query = typeof search.q === "string" ? search.q.slice(0,120) : "";
  const application = typeof search.application === "string" && /^[a-f0-9-]{36}$/i.test(search.application) ? search.application : "";
  try {
    const [choices, data] = await Promise.all([getEntryChoices(), getMaterialWorkspace("documents", { tab, query, applicationId: application || undefined, page: parsePage(search.page) })]);
    const ownedApplication = choices.applications.some((item) => item.id === application) ? application : "";
    return <MaterialsWorkspace key={JSON.stringify([tab,query,application,data.page])} kind="documents" choices={choices} data={data} initialApplication={ownedApplication} initialTab={tab} initialQuery={query} />;
  } catch { return <EntryRetry href="/dashboard" />; }
}
