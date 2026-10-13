export interface ApplicationSummary {
  id: string;
  status: string;
  priority: number;
  programs: {
    name: string;
    institutions: { name: string; country_name: string | null } | null;
  } | null;
}

export interface ApplicationPage {
  items: ApplicationSummary[];
  page: number;
  total: number;
  pageSize: 24;
  stages: string[];
}

const stages = [
  { label: "In progress", statuses: ["researching", "draft", "preparing", "ready"] },
  { label: "Submitted", statuses: ["submitted", "under_review", "interview", "waitlisted"] },
  { label: "Decisions", statuses: ["admitted", "rejected", "withdrawn", "deferred", "enrolled"] },
];

export function filterApplications(
  applications: ApplicationSummary[],
  query: string,
  status: string,
) {
  const search = query.trim().toLowerCase();
  return applications.filter(
    (application) =>
      (status === "all" || application.status === status) &&
      [
        application.programs?.name,
        application.programs?.institutions?.name,
        application.programs?.institutions?.country_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search),
  );
}

export function groupApplications(applications: ApplicationSummary[]) {
  const groups = stages.map((stage) => ({
    label: stage.label,
    applications: applications.filter((application) => stage.statuses.includes(application.status)),
  }));
  const other = applications.filter(
    (application) => !stages.some((stage) => stage.statuses.includes(application.status)),
  );
  if (other.length) groups.push({ label: "Other stages", applications: other });
  return groups;
}
