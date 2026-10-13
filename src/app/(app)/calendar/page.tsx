import { getEntryChoices } from "@/features/entries/actions";
import { EntryRetry } from "@/features/entries/retry";
import { getPlanningData } from "@/features/planning/actions";
import { CalendarWorkspace } from "@/features/planning/calendar-workspace";
import { dateKey } from "@/features/planning/dates";
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  try {
    const choices = await getEntryChoices();
    const today = dateKey(new Date(), choices.timezone);
    const month = today.slice(0, 7);
    const initial = await getPlanningData(month);
    return (
      <CalendarWorkspace
        initial={initial}
        initialMonth={month}
        today={today}
        choices={choices}
        initialApplication={
          typeof search.application === "string" &&
          choices.applications.some((item) => item.id === search.application)
            ? search.application
            : ""
        }
      />
    );
  } catch {
    return <EntryRetry href="/dashboard" />;
  }
}
