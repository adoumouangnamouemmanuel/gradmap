import { NewEntry, type EntrySearch } from "@/features/entries/new-entry";
export default async function Page({ searchParams }: { searchParams: Promise<EntrySearch> }) {
  const search = await searchParams;
  return (
    <NewEntry
      kind={search.mode === "application" ? "scholarshipApplication" : "scholarship"}
      search={search}
    />
  );
}
