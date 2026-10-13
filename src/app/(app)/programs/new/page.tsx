import { NewEntry, type EntrySearch } from "@/features/entries/new-entry";
export default async function Page({ searchParams }: { searchParams: Promise<EntrySearch> }) {
  return <NewEntry kind="program" search={await searchParams} />;
}
