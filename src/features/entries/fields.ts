import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  COUNTRIES,
  CURRENCIES,
  DEADLINE_TYPES,
  DEADLINE_TYPE_LABELS,
  DEGREE_TYPES,
  FUNDING_TYPES,
  FUNDING_TYPE_LABELS,
  SCHOLARSHIP_MECHANISMS,
  SCHOLARSHIP_MECHANISM_LABELS,
} from "@/lib/constants";
import type { FieldConfig, FieldGroup } from "@/components/domain/create-page";
import { applicationLabel, requestLabel, type EntryChoices } from "./choices";
import type { EntryKind } from "./schemas";

export const entryInfo: Record<
  EntryKind,
  { title: string; backHref: string; backLabel: string; successHref: string; description: string }
> = {
  scholarshipApplication: {
    title: "Plan a scholarship application",
    backHref: "/scholarships",
    backLabel: "Funding",
    successHref: "/scholarships",
    description:
      "Choose the funding opportunity first. Link a program application when it is relevant, or pursue the scholarship independently.",
  },
  scholarship: {
    title: "Explore a funding opportunity",
    backHref: "/scholarships",
    backLabel: "Scholarships",
    successHref: "/scholarships/{id}",
    description:
      "Keep a scholarship independently, or connect it to programs you’re considering. Verify eligibility against its official source.",
  },
  institution: {
    title: "Add an institution",
    backHref: "/institutions",
    backLabel: "Institutions",
    successHref: "/programs/new?institution={id}",
    description:
      "Start with the university or school. Its programs and applications will stay connected.",
  },
  program: {
    title: "Add a program",
    backHref: "/programs",
    backLabel: "Programs",
    successHref: "/programs/{id}",
    description: "Choose the institution first, then capture the program you’re considering.",
  },
  application: {
    title: "Start an application",
    backHref: "/applications",
    backLabel: "Applications",
    successHref: "/applications/{id}",
    description:
      "Choose an institution and one of its programs. Build your preparation around that application.",
  },
  deadline: {
    title: "Add a deadline",
    backHref: "/calendar",
    backLabel: "Calendar",
    successHref: "/calendar",
    description: "Give the date a clear purpose and connect it to the work it belongs to.",
  },
  task: {
    title: "Plan a task",
    backHref: "/calendar",
    backLabel: "Calendar",
    successHref: "/calendar",
    description:
      "Choose a useful next step. A task can have a due date, or stay in your undated queue.",
  },
  essay: {
    title: "Create a writing brief",
    backHref: "/essays",
    backLabel: "Writing",
    successHref: "/essays/{id}",
    description:
      "Capture the prompt and limits. Link it to an application, or keep it as reusable writing.",
  },
  document: {
    title: "Add to your document library",
    backHref: "/documents",
    backLabel: "Documents",
    successHref: "/documents/{id}",
    description:
      "Create a reusable document record, then upload a private file version on its detail page.",
  },
  requirement: {
    title: "Track a document requirement",
    backHref: "/documents",
    backLabel: "Documents",
    successHref: "/documents",
    description:
      "Choose the application and name what it needs. Attach a library version when the file is ready.",
  },
  recommender: {
    title: "Add a recommender",
    backHref: "/recommenders",
    backLabel: "People & recommendations",
    successHref: "/recommenders/{id}",
    description:
      "Save the person first. You can then track separate requests for each application.",
  },
  contact: {
    title: "Add a contact",
    backHref: "/contacts",
    backLabel: "Contacts",
    successHref: "/contacts/{id}",
    description:
      "Keep a research contact independently, or connect them to a program you’re exploring.",
  },
  recommendation: {
    title: "Track a recommendation request",
    backHref: "/recommenders",
    backLabel: "People & recommendations",
    successHref: "/recommenders",
    description:
      "Connect an existing recommender to an application and track the letter’s progress. No message is sent.",
  },
};

export function entryFields(
  kind: EntryKind,
  choices: EntryChoices,
  defaults: Record<string, string>,
): (FieldConfig | FieldGroup)[] {
  const notes: FieldConfig = {
    id: "notes",
    label: "Notes",
    kind: "textarea",
    rows: 4,
    hint: "Only include details you want to keep in your private workspace.",
  };
  const priority: FieldConfig = {
    id: "priority",
    label: "Priority",
    type: "number",
    min: 1,
    max: 5,
    defaultValue: 3,
  };
  const due: FieldConfig = {
    id: "due_at",
    label: kind === "task" ? "Planned due time" : "Due date and time",
    type: "datetime-local",
    required: kind === "deadline",
    defaultValue: defaults.date ? `${defaults.date}T17:00` : undefined,
  };
  const zone: FieldConfig = {
    id: "timezone",
    label: "Timezone",
    defaultValue: choices.timezone,
    required: true,
    hint: "IANA timezone, for example Africa/Accra or Europe/Paris. Dates are stored as UTC instants.",
  };
  const applicationOptions = [
    { value: "", label: "Choose an application" },
    ...choices.applications.map((application) => ({
      value: application.id,
      label: applicationLabel(application, choices),
    })),
  ];
  function contexts(required = false, programs = false): FieldConfig[] {
    const context =
      kind === "task" && defaults.document
        ? "document"
        : kind === "task" && defaults.essay
          ? "essay"
          : kind === "task" && defaults.request
            ? "request"
            : defaults.application
              ? "application"
              : defaults.program && programs
                ? "program"
                : defaults.scholarship
                  ? "scholarship"
                  : required
                    ? "application"
                    : "general";
    return [
      {
        id: "context",
        label: "Belongs to",
        defaultValue: context,
        options: [
          ...(!required ? [{ value: "general", label: "General / reusable" }] : []),
          { value: "application", label: "Program application" },
          { value: "scholarship_application", label: "Scholarship application" },
          ...(programs
            ? [
                { value: "program", label: "Program research" },
                { value: "scholarship", label: "Scholarship research" },
              ]
            : []),
          ...(kind === "task"
            ? [
                { value: "document", label: "Document preparation" },
                { value: "essay", label: "Writing preparation" },
                { value: "request", label: "Recommendation follow-up" },
              ]
            : []),
        ],
        hint: required
          ? "This entry needs an application."
          : "Choose General for independent work. Linked entries appear in their parent workspace.",
      },
      {
        id: "application_id",
        label: "Application",
        required: true,
        options: applicationOptions.map((option) => ({ ...option, parentValue: "application" })),
        dependsOn: "context",
        visibleWhen: { field: "context", value: "application" },
        defaultValue: defaults.application || "",
        createHref: "/applications/new",
      },
      {
        id: "scholarship_application_id",
        label: "Scholarship application",
        required: true,
        options: [
          { value: "", label: "Choose a scholarship application" },
          ...choices.scholarshipApplications.map((application) => ({
            value: application.id,
            parentValue: "scholarship_application",
            label: `${choices.scholarships.find((item) => item.id === application.scholarship_id)?.name || "Scholarship"} · ${application.status.replaceAll("_", " ")}`,
          })),
        ],
        dependsOn: "context",
        visibleWhen: { field: "context", value: "scholarship_application" },
        createHref: "/scholarships/new?mode=application",
      },
      ...(programs
        ? [
            {
              id: "program_id",
              label: "Program",
              required: true,
              options: [
                { value: "", label: "Choose a program" },
                ...choices.programs.map((program) => ({
                  value: program.id,
                  label: program.name,
                  parentValue: "program",
                })),
              ],
              dependsOn: "context",
              visibleWhen: { field: "context", value: "program" },
              defaultValue: defaults.program || "",
              createHref: "/programs/new",
            },
            {
              id: "scholarship_id",
              label: "Scholarship",
              required: true,
              options: [
                { value: "", label: "Choose a scholarship" },
                ...choices.scholarships.map((scholarship) => ({
                  value: scholarship.id,
                  label: scholarship.name,
                  parentValue: "scholarship",
                })),
              ],
              dependsOn: "context",
              visibleWhen: { field: "context", value: "scholarship" },
              defaultValue: defaults.scholarship || "",
              createHref: "/scholarships/new",
            },
          ]
        : []),
      ...(kind === "task"
        ? [
            {
              id: "document_id",
              label: "Document",
              required: true,
              options: [
                { value: "", label: "Choose a document" },
                ...choices.documents.map((item) => ({
                  value: item.id,
                  label: item.name,
                  parentValue: "document",
                })),
              ],
              dependsOn: "context",
              visibleWhen: { field: "context", value: "document" },
              defaultValue: defaults.document || "",
              createHref: "/documents/new",
            },
            {
              id: "essay_prompt_id",
              label: "Writing brief",
              required: true,
              options: [
                { value: "", label: "Choose a writing brief" },
                ...choices.essays.map((item) => ({
                  value: item.id,
                  label: item.title,
                  parentValue: "essay",
                })),
              ],
              dependsOn: "context",
              visibleWhen: { field: "context", value: "essay" },
              defaultValue: defaults.essay || "",
              createHref: "/essays/new",
            },
            {
              id: "recommendation_request_id",
              label: "Recommendation request",
              required: true,
              options: [
                { value: "", label: "Choose a request" },
                ...choices.requests.map((item) => ({
                  value: item.id,
                  label: requestLabel(item, choices),
                  parentValue: "request",
                })),
              ],
              dependsOn: "context",
              visibleWhen: { field: "context", value: "request" },
              defaultValue: defaults.request || "",
              createHref: "/recommenders/new?mode=request",
            },
          ]
        : []),
    ];
  }
  switch (kind) {
    case "scholarshipApplication":
      return [
        {
          id: "scholarship_id",
          label: "Scholarship",
          required: true,
          defaultValue: defaults.scholarship || "",
          options: [
            { value: "", label: "Choose a scholarship" },
            ...choices.scholarships.map((item) => ({ value: item.id, label: item.name })),
          ],
          createHref: "/scholarships/new",
        },
        {
          id: "application_id",
          label: "Related program application",
          defaultValue: defaults.application || "",
          options: [
            { value: "", label: "Independent scholarship application" },
            ...applicationOptions.filter((option) => option.value),
          ],
          createHref: "/applications/new",
          hint: "Optional. This does not submit either application.",
        },
        { id: "nomination_required", label: "Requires a nomination", kind: "checkbox" },
        notes,
      ];
    case "scholarship":
      return [
        { id: "name", label: "Scholarship name", required: true },
        {
          label: "Source",
          fields: [
            { id: "provider", label: "Provider" },
            { id: "official_url", label: "Official scholarship page", type: "url" },
          ],
        },
        {
          label: "Funding & coverage",
          fields: [
            {
              id: "funding_type",
              label: "Funding type",
              defaultValue: "other",
              options: FUNDING_TYPES.map((value) => ({ value, label: FUNDING_TYPE_LABELS[value] })),
            },
            {
              id: "amount",
              label: "Published amount",
              placeholder: "0.00",
              hint: "Optional. Enter the exact amount without commas.",
            },
            {
              id: "currency_code",
              label: "Currency",
              defaultValue: "USD",
              options: CURRENCIES.map((currency) => ({
                value: currency.code,
                label: `${currency.label}`,
              })),
            },
            { id: "coverage_notes", label: "What it covers", kind: "textarea", rows: 3 },
          ],
        },
        {
          label: "Eligibility & process",
          fields: [
            {
              id: "application_mechanism",
              label: "Application process",
              defaultValue: "other",
              options: [
                ...SCHOLARSHIP_MECHANISMS.map((value) => ({
                  value,
                  label: SCHOLARSHIP_MECHANISM_LABELS[value],
                })),
                { value: "other", label: "Other / not confirmed" },
              ],
            },
            {
              id: "eligibility_status",
              label: "Eligibility assessment",
              defaultValue: "unknown",
              options: ["unknown", "likely", "eligible", "ineligible", "needs_verification"].map(
                (value) => ({ value, label: value.replaceAll("_", " ") }),
              ),
            },
            { id: "eligibility_notes", label: "Eligibility notes", kind: "textarea", rows: 3 },
            {
              id: "service_obligation_notes",
              label: "Service obligations",
              kind: "textarea",
              rows: 3,
            },
          ],
        },
        {
          id: "program_ids",
          label: "Potentially compatible programs",
          multiple: true,
          defaultValue: defaults.program ? [defaults.program] : [],
          options: choices.programs.map((program) => ({
            value: program.id,
            label: `${program.name} · ${choices.institutions.find((item) => item.id === program.institution_id)?.name || "Institution"}`,
          })),
          createHref: "/programs/new",
          hint: "Optional. Links start as Needs verification; selecting a program does not confirm eligibility.",
        },
      ];
    case "institution":
      return [
        {
          id: "name",
          label: "Institution name",
          required: true,
          placeholder: "University or school name",
        },
        {
          label: "Location",
          fields: [
            {
              id: "country_name",
              label: "Country",
              options: [
                { value: "", label: "Choose a country" },
                ...COUNTRIES.map((country) => ({ value: country, label: country })),
              ],
            },
            { id: "city", label: "City" },
          ],
        },
        { id: "website_url", label: "Official website", type: "url", placeholder: "https://" },
        notes,
      ];
    case "program":
      return [
        {
          id: "institution_id",
          label: "Institution",
          required: true,
          defaultValue: defaults.institution || "",
          options: [
            { value: "", label: "Choose an institution" },
            ...choices.institutions.map((institution) => ({
              value: institution.id,
              label: `${institution.name}${institution.country_name ? ` · ${institution.country_name}` : ""}`,
            })),
          ],
          createHref: "/institutions/new",
        },
        {
          id: "name",
          label: "Program name",
          required: true,
          placeholder: "MSc Artificial Intelligence",
        },
        {
          label: "Academic direction",
          fields: [
            {
              id: "degree_type",
              label: "Degree",
              options: [
                { value: "", label: "Choose a degree" },
                ...DEGREE_TYPES.map((degree) => ({ value: degree, label: degree })),
              ],
            },
            { id: "field", label: "Field of study" },
          ],
        },
        {
          label: "Intake & format",
          fields: [
            {
              id: "intake_year",
              label: "Intake year",
              type: "number",
              defaultValue: 2027,
              min: 2020,
              max: 2035,
            },
            {
              id: "intake_term",
              label: "Term",
              options: [
                { value: "", label: "Not confirmed" },
                ...["fall", "spring", "summer", "winter", "other"].map((term) => ({
                  value: term,
                  label: term,
                })),
              ],
            },
            {
              id: "duration_months",
              label: "Duration in months",
              type: "number",
              min: 1,
              max: 120,
            },
            {
              id: "delivery_mode",
              label: "Study format",
              options: [
                { value: "", label: "Not confirmed" },
                { value: "on_campus", label: "On campus" },
                { value: "online", label: "Online" },
                { value: "hybrid", label: "Hybrid" },
              ],
            },
          ],
        },
        { id: "program_url", label: "Official program page", type: "url" },
        { id: "research_notes", label: "Research notes", kind: "textarea", rows: 4 },
      ];
    case "application": {
      const program = choices.programs.find((item) => item.id === defaults.program);
      return [
        {
          label: "Choose your opportunity",
          fields: [
            {
              id: "institution_id",
              label: "Institution",
              required: true,
              defaultValue: defaults.institution || program?.institution_id || "",
              options: [
                { value: "", label: "Choose an institution" },
                ...choices.institutions.map((item) => ({ value: item.id, label: item.name })),
              ],
              createHref: "/institutions/new",
            },
            {
              id: "program_id",
              label: "Program",
              required: true,
              dependsOn: "institution_id",
              defaultValue: program?.id || "",
              options: [
                { value: "", label: "Choose a program" },
                ...choices.programs.map((item) => ({
                  value: item.id,
                  label: item.name,
                  parentValue: item.institution_id,
                })),
              ],
              createHref: "/programs/new",
              hint: "Only programs at the selected institution are offered.",
            },
          ],
        },
        {
          label: "Your plan",
          fields: [
            {
              id: "status",
              label: "Stage",
              defaultValue: "researching",
              options: APPLICATION_STATUSES.map((status) => ({
                value: status,
                label: APPLICATION_STATUS_LABELS[status],
              })),
            },
            priority,
            {
              id: "application_round",
              label: "Application round",
              placeholder: "Main / early / rolling",
            },
            { id: "portal_url", label: "Application portal", type: "url" },
          ],
        },
        notes,
      ];
    }
    case "deadline":
    case "task":
      return [
        {
          id: "title",
          label: "Title",
          required: true,
          defaultValue: defaults.title || "",
          placeholder:
            kind === "task" ? "Prepare a first statement draft" : "Submit the application",
        },
        { label: "Context", fields: contexts(false, true) },
        { label: "Timing", fields: [due, zone] },
        ...(kind === "deadline"
          ? [
              {
                id: "deadline_type",
                label: "Deadline type",
                defaultValue: "application",
                options: DEADLINE_TYPES.map((type) => ({
                  value: type,
                  label: DEADLINE_TYPE_LABELS[type],
                })),
              },
              { id: "source_url", label: "Official source", type: "url" },
            ]
          : [
              {
                label: "Priority & impact",
                fields: [
                  priority,
                  {
                    id: "blocking",
                    label: "Blocks application progress",
                    kind: "checkbox" as const,
                    hint: "Use this only if other preparation cannot proceed until it is done.",
                  },
                ],
              },
            ]),
        notes,
      ];
    case "essay":
      return [
        {
          id: "title",
          label: "Writing title",
          required: true,
          placeholder: "Statement of purpose",
        },
        { label: "Context", fields: contexts() },
        { id: "prompt_text", label: "The prompt", kind: "textarea", rows: 5 },
        {
          label: "Submission limits",
          fields: [
            { id: "word_limit", label: "Word limit", type: "number", min: 1, max: 100000 },
            {
              id: "character_limit",
              label: "Character limit",
              type: "number",
              min: 1,
              max: 1000000,
            },
          ],
        },
        notes,
      ];
    case "document":
      return [
        { id: "name", label: "Document name", required: true, placeholder: "Academic transcript" },
        {
          id: "document_type",
          label: "Document type",
          defaultValue: "other",
          options: [
            "transcript",
            "diploma",
            "cv",
            "passport",
            "recommendation_letter",
            "test_score",
            "financial_proof",
            "english_proficiency",
            "portfolio",
            "other",
          ].map((type) => ({ value: type, label: type.replaceAll("_", " ") })),
        },
        notes,
      ];
    case "requirement":
      return [
        { label: "Required by", fields: contexts(true) },
        {
          id: "requirement_name",
          label: "Requirement name",
          required: true,
          placeholder: "Certified academic transcript",
        },
        {
          id: "document_type",
          label: "Document type",
          options: [
            "transcript",
            "diploma",
            "cv",
            "passport",
            "test_score",
            "financial_proof",
            "english_proficiency",
            "portfolio",
            "recommendation_letter",
            "other",
          ].map((type) => ({ value: type, label: type.replaceAll("_", " ") })),
        },
        { label: "Timing", fields: [due, zone] },
        notes,
      ];
    case "recommender":
      return [
        { id: "name", label: "Name", required: true },
        {
          label: "Professional details",
          fields: [
            { id: "email", label: "Email", type: "email" },
            { id: "title", label: "Title / role" },
            { id: "institution", label: "Institution / organization" },
            { id: "relationship", label: "How you know them", placeholder: "Project supervisor" },
          ],
        },
        notes,
      ];
    case "contact":
      return [
        { id: "name", label: "Name", required: true },
        {
          label: "Contact details",
          fields: [
            { id: "email", label: "Email", type: "email" },
            { id: "phone", label: "Phone" },
            { id: "role", label: "Role" },
            { id: "institution", label: "Organization / institution" },
          ],
        },
        {
          id: "program_id",
          label: "Program context",
          options: [
            { value: "", label: "Independent contact" },
            ...choices.programs.map((program) => ({ value: program.id, label: program.name })),
          ],
          createHref: "/programs/new",
        },
        notes,
      ];
    case "recommendation":
      return [
        {
          id: "recommender_id",
          label: "Recommender",
          required: true,
          defaultValue: defaults.recommender || "",
          options: [
            { value: "", label: "Choose a recommender" },
            ...choices.recommenders.map((item) => ({
              value: item.id,
              label: `${item.name}${item.institution ? ` · ${item.institution}` : ""}`,
            })),
          ],
          createHref: "/recommenders/new",
        },
        { label: "For this application", fields: contexts(true) },
        { label: "Requested delivery", fields: [due, zone] },
        notes,
      ];
  }
}
