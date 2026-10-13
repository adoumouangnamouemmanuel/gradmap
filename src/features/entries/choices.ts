export interface EntryChoices {
  institutions: { id: string; name: string; country_name: string | null }[];
  programs: { id: string; name: string; institution_id: string }[];
  applications: { id: string; program_id: string; status: string }[];
  scholarships: { id: string; name: string }[];
  scholarshipApplications: { id: string; scholarship_id: string; status: string }[];
  recommenders: { id: string; name: string; institution: string | null }[];
  documents: { id: string; name: string }[];
  essays: { id: string; title: string }[];
  requests: {
    id: string;
    recommender_id: string;
    application_id: string | null;
    scholarship_application_id: string | null;
  }[];
  limited?: boolean;
  timezone: string;
}
export function applicationLabel(
  application: EntryChoices["applications"][number],
  choices: EntryChoices,
) {
  const program = choices.programs.find((item) => item.id === application.program_id);
  const institution = choices.institutions.find((item) => item.id === program?.institution_id);
  return `${program?.name || "Application"}${institution ? ` · ${institution.name}` : ""}`;
}

export function requestLabel(request: EntryChoices["requests"][number], choices: EntryChoices) {
  const person = choices.recommenders.find((item) => item.id === request.recommender_id);
  const application = choices.applications.find((item) => item.id === request.application_id);
  const scholarshipApplication = choices.scholarshipApplications.find((item) => item.id === request.scholarship_application_id);
  const scholarship = choices.scholarships.find((item) => item.id === scholarshipApplication?.scholarship_id);
  return `${person?.name || "Recommendation"} · ${application ? applicationLabel(application, choices) : scholarship?.name || "Scholarship application"}`;
}

export function changeDependentChoices(
  fields: { id: string; dependsOn?: string; multiple?: boolean }[],
  previous: Record<string, string | string[]>,
  fieldId: string,
  value: string | string[],
) {
  if (previous[fieldId] === value) return previous;
  const next = { ...previous, [fieldId]: value };
  const cleared = new Set([fieldId]);
  for (let pass = 0; pass < fields.length; pass++) for (const field of fields) {
    if (field.dependsOn && cleared.has(field.dependsOn) && !cleared.has(field.id)) {
      next[field.id] = field.multiple ? [] : "";
      cleared.add(field.id);
    }
  }
  return next;
}
