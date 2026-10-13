import Link from "next/link";
import { CreatePage } from "@/components/domain/create-page";
import { getEntryChoices, createEntryFromForm } from "./actions";
import { entryFields, entryInfo } from "./fields";
import type { EntryKind } from "./schemas";
import type { EntryChoices } from "./choices";
import { EntryRetry } from "./retry";

export type EntrySearch = Record<string, string | string[] | undefined>;
export async function NewEntry({ kind, search = {} }: { kind: EntryKind; search?: EntrySearch }) {
  const info = entryInfo[kind];
  let choices: EntryChoices = {
    institutions: [],
    programs: [],
    applications: [],
    scholarships: [],
    scholarshipApplications: [],
    recommenders: [],
    documents: [],
    essays: [],
    requests: [],
    timezone: "Africa/Accra",
  };
  if (!["institution", "document", "recommender"].includes(kind)) {
    try {
      choices = await getEntryChoices();
    } catch {
      return <EntryRetry href={info.backHref} />;
    }
  }
  const defaults: Record<string, string> = {};
  for (const [key, value] of Object.entries(search))
    if (
      [
        "application",
        "program",
        "institution",
        "scholarship",
        "recommender",
        "document",
        "essay",
        "request",
        "date",
        "title",
      ].includes(key) &&
      typeof value === "string" &&
      value.length <= 200
    )
      defaults[key] = value;
  return (
    <>
      {["document", "requirement"].includes(kind) && (
        <nav
          aria-label="Document entry type"
          className="mx-auto flex max-w-[1440px] gap-3 px-5 pt-5 lg:px-10"
        >
          <Link
            className="bg-card rounded-xl px-4 py-2 text-sm"
            aria-current={kind === "document" ? "page" : undefined}
            href="/documents/new"
          >
            Library document
          </Link>
          <Link
            className="bg-card rounded-xl px-4 py-2 text-sm"
            aria-current={kind === "requirement" ? "page" : undefined}
            href="/documents/new?mode=requirement"
          >
            Application requirement
          </Link>
        </nav>
      )}
      {["recommender", "recommendation"].includes(kind) && (
        <nav
          aria-label="Recommendation entry type"
          className="mx-auto flex max-w-[1440px] gap-3 px-5 pt-5 lg:px-10"
        >
          <Link className="bg-card rounded-xl px-4 py-2 text-sm" href="/recommenders/new">
            Add a person
          </Link>
          <Link
            className="bg-card rounded-xl px-4 py-2 text-sm"
            href="/recommenders/new?mode=request"
          >
            Track a request
          </Link>
        </nav>
      )}
      <CreatePage
        {...info}
        submitLabel="Save entry"
        action={createEntryFromForm.bind(null, kind)}
        fields={entryFields(kind, choices, defaults)}
        notice={
          choices.limited
            ? "This form has reached its choice limit. Some older entries may not be available here."
            : undefined
        }
        context={
          kind === "document"
            ? "Library documents are reusable and do not need an application. Create a separate requirement to track which application needs a file."
            : kind === "recommender"
              ? "A recommender is a reusable contact. A recommendation request connects that person to one application and its delivery date."
              : undefined
        }
      />
    </>
  );
}
