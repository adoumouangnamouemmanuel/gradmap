import { z } from "zod";
import {
  APPLICATION_STATUSES,
  COUNTRIES,
  CURRENCIES,
  DEADLINE_TYPES,
  DEGREE_TYPES,
  FUNDING_TYPES,
  SCHOLARSHIP_MECHANISMS,
  SCHOLARSHIP_STATUSES,
} from "@/lib/constants";
import { validTimezone } from "@/features/planning/dates";

const blank = (value: unknown) => (value === "" || value === null ? undefined : value);
export const optionalId = z.preprocess(blank, z.string().uuid().optional());
const text = (max = 2000) => z.preprocess(blank, z.string().trim().max(max).optional());
const title = z.string().trim().min(1, "Give this entry a name.").max(200);
const url = z.preprocess(
  blank,
  z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS link.")
    .optional(),
);
const integer = (min: number, max: number) =>
  z.preprocess(blank, z.coerce.number().int().min(min).max(max).optional());
const priority = integer(1, 5);
const due = z.preprocess(blank, z.string().max(40).optional());
const timezone = z
  .string()
  .refine(validTimezone, "Choose a valid IANA timezone.")
  .default("Africa/Accra");
const links = {
  application_id: optionalId,
  program_id: optionalId,
  scholarship_id: optionalId,
  scholarship_application_id: optionalId,
};
const oneTarget = (value: Record<string, unknown>) =>
  Object.keys(links).filter((key) => value[key]).length <= 1;

export const entrySchemas = {
  scholarshipApplication: z.object({
    scholarship_id: z.string().uuid("Choose a scholarship."),
    application_id: optionalId,
    status: z.enum(SCHOLARSHIP_STATUSES).default("researching"),
    nomination_required: z.boolean().optional(),
    notes: text(10000),
  }),
  scholarship: z.object({
    name: title,
    provider: text(200),
    official_url: url,
    funding_type: z.enum(FUNDING_TYPES).default("other"),
    amount: z.preprocess(
      blank,
      z
        .string()
        .regex(/^\d{1,10}(\.\d{1,2})?$/, "Use an amount with up to two decimal places.")
        .optional(),
    ),
    currency_code: z
      .string()
      .refine(
        (value) => CURRENCIES.some((currency) => currency.code === value),
        "Choose a supported currency.",
      )
      .default("USD"),
    coverage_notes: text(10000),
    application_mechanism: z.enum([...SCHOLARSHIP_MECHANISMS, "other"]).default("other"),
    eligibility_status: z
      .enum(["unknown", "likely", "eligible", "ineligible", "needs_verification"])
      .default("unknown"),
    eligibility_notes: text(10000),
    service_obligation_notes: text(10000),
    program_ids: z.array(z.string().uuid()).max(100).default([]),
  }),
  institution: z.object({
    name: title,
    country_name: z.preprocess(blank, z.enum(COUNTRIES).optional()),
    country_code: text(2),
    city: text(120),
    website_url: url,
    notes: text(10000),
  }),
  program: z.object({
    institution_id: z.string().uuid("Choose an institution."),
    name: title,
    degree_type: z.preprocess(blank, z.enum(DEGREE_TYPES).optional()),
    department: text(160),
    field: text(160),
    intake_term: z.preprocess(
      blank,
      z.enum(["fall", "spring", "winter", "summer", "other"]).optional(),
    ),
    intake_year: integer(2020, 2035),
    duration_months: integer(1, 120),
    delivery_mode: z.preprocess(
      blank,
      z.enum(["on_campus", "hybrid", "online", "other"]).optional(),
    ),
    program_url: url,
    application_portal_url: url,
    status: z
      .enum(["exploring", "shortlisted", "applying", "applied", "withdrawn", "closed"])
      .optional(),
    display_priority: priority,
    research_notes: text(10000),
    requirements_summary: text(10000),
  }),
  application: z.object({
    institution_id: optionalId,
    program_id: z.string().uuid("Choose a program."),
    status: z.enum(APPLICATION_STATUSES).optional(),
    priority,
    application_round: text(100),
    portal_url: url,
    notes: text(10000),
  }),
  deadline: z
    .object({
      title,
      ...links,
      deadline_type: z.enum(DEADLINE_TYPES).default("other"),
      due_at: z.string().min(1, "Choose a due date."),
      timezone,
      source_url: url,
      notes: text(10000),
      is_date_only: z.boolean().optional(),
      is_hard_deadline: z.boolean().optional(),
    })
    .refine(oneTarget, "Choose one context: application, program, scholarship, or general."),
  task: z
    .object({
      title,
      ...links,
      description: text(10000),
      due_at: due,
      timezone,
      priority,
      blocking: z.boolean().optional(),
      document_id: optionalId,
      essay_prompt_id: optionalId,
      recommendation_request_id: optionalId,
    })
    .refine(
      (value) =>
        [
          value.application_id,
          value.program_id,
          value.scholarship_id,
          value.scholarship_application_id,
          value.document_id,
          value.essay_prompt_id,
          value.recommendation_request_id,
        ].filter(Boolean).length <= 1,
      "Choose one context for this task.",
    ),
  essay: z
    .object({
      title,
      prompt_text: text(20000),
      application_id: optionalId,
      scholarship_application_id: optionalId,
      word_limit: integer(1, 100000),
      character_limit: integer(1, 1000000),
      notes: text(10000),
    })
    .refine(oneTarget, "Choose one application for this essay."),
  document: z.object({
    name: title,
    document_type: z
      .enum([
        "other",
        "transcript",
        "diploma",
        "cv",
        "passport",
        "recommendation_letter",
        "test_score",
        "financial_proof",
        "english_proficiency",
        "portfolio",
      ])
      .default("other"),
    notes: text(10000),
  }),
  requirement: z
    .object({
      requirement_name: title,
      application_id: optionalId,
      scholarship_application_id: optionalId,
      document_type: text(80),
      is_required: z.boolean().optional(),
      due_at: due,
      timezone,
      notes: text(10000),
    })
    .refine(
      (value) => Number(!!value.application_id) + Number(!!value.scholarship_application_id) === 1,
      "Choose the application that requires this document.",
    ),
  recommender: z.object({
    name: title,
    email: z.preprocess(blank, z.string().email().optional()),
    title: text(120),
    institution: text(200),
    relationship: text(200),
    notes: text(10000),
  }),
  contact: z.object({
    name: title,
    email: z.preprocess(blank, z.string().email().optional()),
    phone: text(60),
    role: text(160),
    institution: text(200),
    program_id: optionalId,
    notes: text(10000),
  }),
  recommendation: z
    .object({
      recommender_id: z.string().uuid("Choose a recommender."),
      application_id: optionalId,
      scholarship_application_id: optionalId,
      due_at: due,
      timezone,
      notes: text(10000),
    })
    .refine(
      (value) => Number(!!value.application_id) + Number(!!value.scholarship_application_id) === 1,
      "Choose the application for this recommendation request.",
    ),
};
export type EntryKind = keyof typeof entrySchemas;

export const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  timezone,
  target_intake_year: z.coerce.number().int().min(2020).max(2035),
  field_of_study: text(160),
  current_qualification: text(160),
  academic_institution: text(200),
  career_goal: text(2000),
  research_interests: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  preferred_countries: z.array(z.enum(COUNTRIES)).max(30).default([]),
  target_degrees: z.array(z.enum(DEGREE_TYPES)).max(12).default([]),
  funding_preference: z
    .enum(["undecided", "required", "preferred", "self_funded"])
    .default("undecided"),
  delivery_preferences: z
    .array(z.enum(["on_campus", "online", "hybrid"]))
    .max(3)
    .default([]),
  preferred_languages: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  annual_tuition_budget: z.preprocess(
    blank,
    z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, "Use a nonnegative amount with up to two decimal places.")
      .optional(),
  ),
  budget_currency: z
    .string()
    .refine(
      (value) => CURRENCIES.some((currency) => currency.code === value),
      "Choose a supported currency.",
    )
    .default("USD"),
  study_start_term: z.enum(["any", "fall", "spring", "summer", "winter"]).default("any"),
});
export type StudyProfile = z.infer<typeof profileSchema>;
