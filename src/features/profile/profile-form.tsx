"use client";
import { CreatePage, type FieldConfig, type FieldGroup } from "@/components/domain/create-page";
import { COUNTRIES, CURRENCIES, DEGREE_TYPES } from "@/lib/constants";
import type { StudyProfile } from "@/features/entries/schemas";
import { saveProfile } from "./actions";

export function ProfileForm({
  profile,
  preferencesReady,
}: {
  profile: StudyProfile;
  preferencesReady: boolean;
}) {
  const fields: FieldGroup[] = [
    {
      label: "Account & timing",
      description: "The name and timezone used throughout your workspace.",
      fields: [
        { id: "full_name", label: "Full name", required: true, defaultValue: profile.full_name },
        {
          id: "timezone",
          label: "Timezone",
          required: true,
          defaultValue: profile.timezone,
          hint: "IANA timezone, for example Africa/Accra.",
        },
        {
          id: "target_intake_year",
          label: "Target intake year",
          type: "number",
          min: 2020,
          max: 2035,
          required: true,
          defaultValue: profile.target_intake_year,
        },
      ],
    },
    {
      label: "Academic direction",
      fields: [
        {
          id: "field_of_study",
          label: "Field of study / domain",
          defaultValue: profile.field_of_study,
          placeholder: "Computer engineering, public health…",
        },
        {
          id: "current_qualification",
          label: "Current / completed qualification",
          defaultValue: profile.current_qualification,
        },
        {
          id: "academic_institution",
          label: "Current institution",
          defaultValue: profile.academic_institution,
        },
        {
          id: "research_interests",
          label: "Research interests",
          defaultValue: profile.research_interests.join(", "),
          hint: "Separate interests with commas. Up to 20.",
        },
      ],
    },
    {
      label: "Where & how you want to study",
      fields: [
        {
          id: "preferred_countries",
          label: "Preferred countries",
          multiple: true,
          defaultValue: profile.preferred_countries,
          options: COUNTRIES.map((country) => ({ value: country, label: country })),
        },
        {
          id: "target_degrees",
          label: "Target degrees",
          multiple: true,
          defaultValue: profile.target_degrees,
          options: DEGREE_TYPES.map((degree) => ({ value: degree, label: degree })),
        },
        {
          id: "delivery_preferences",
          label: "Study formats",
          multiple: true,
          defaultValue: profile.delivery_preferences,
          options: [
            { value: "on_campus", label: "On campus" },
            { value: "online", label: "Online" },
            { value: "hybrid", label: "Hybrid" },
          ],
        },
        {
          id: "preferred_languages",
          label: "Languages of instruction",
          defaultValue: profile.preferred_languages.join(", "),
          hint: "Separate languages with commas. No language test score is assumed.",
        },
        {
          id: "study_start_term",
          label: "Preferred starting term",
          defaultValue: profile.study_start_term,
          options: ["any", "fall", "spring", "summer", "winter"].map((term) => ({
            value: term,
            label: term === "any" ? "Flexible" : term,
          })),
        },
      ],
    },
    {
      label: "Funding & affordability",
      fields: [
        {
          id: "funding_preference",
          label: "Scholarship preference",
          defaultValue: profile.funding_preference,
          options: [
            { value: "undecided", label: "Still deciding" },
            { value: "required", label: "I need scholarship funding" },
            { value: "preferred", label: "I prefer funded opportunities" },
            { value: "self_funded", label: "I can consider self-funded study" },
          ],
        },
        {
          id: "annual_tuition_budget",
          label: "Maximum annual tuition budget",
          type: "text",
          defaultValue: profile.annual_tuition_budget,
          hint: "Optional planning limit, before living costs. Use up to two decimal places.",
        },
        {
          id: "budget_currency",
          label: "Budget currency",
          defaultValue: profile.budget_currency,
          options: CURRENCIES.map((currency) => ({ value: currency.code, label: currency.label })),
        },
      ],
    },
    {
      label: "Your objective",
      fields: [
        {
          id: "career_goal",
          label: "What do you want this degree to help you achieve?",
          kind: "textarea",
          rows: 5,
          defaultValue: profile.career_goal,
        },
      ],
    },
  ];
  const configured = fields.map((group, index) => ({
    ...group,
    fields: group.fields.map(
      (field): FieldConfig => ({ ...field, disabled: index > 0 && !preferencesReady }),
    ),
  }));
  return (
    <CreatePage
      title="Shape your study goals"
      description="Tell your workspace what matters to you. These preferences will support future program matching; no automated web scan runs today."
      backHref="/settings"
      backLabel="Settings"
      submitLabel="Save profile"
      action={saveProfile}
      fields={configured}
      notice={
        !preferencesReady
          ? "Study preferences are temporarily unavailable. You can still save your account details and target year."
          : undefined
      }
      context="Your interests, location preferences and funding needs are stored as structured information. Empty preferences mean undecided, rather than guessed eligibility. Nothing here guarantees admission or funding."
    />
  );
}
