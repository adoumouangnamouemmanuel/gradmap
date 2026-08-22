"use client";

import { createProgramFromForm } from "@/features/programs/form-actions";
import { CreatePage } from "@/components/domain/create-page";
import { DEGREE_TYPES } from "@/lib/constants";

interface Props {
  institutions: any[];
}

export default function NewProgramForm({ institutions }: Props) {
  return (
    <CreatePage
      title="Add a program"
      backHref="/programs"
      backLabel="Programs"
      submitLabel="Create program"
      action={(formData) => createProgramFromForm(formData)}
      requiredFields={{
        institution_id: "Please select an institution",
        name: "Program name is required",
      }}
      fields={[
        {
          id: "institution_id",
          label: "Institution",
          required: true,
          options: [
            { value: "", label: "Select an institution" },
            ...institutions.map((inst: any) => ({
              value: inst.id,
              label: `${inst.name}${inst.country_name ? `, ${inst.country_name}` : ""}`,
            })),
          ],
        },
        {
          id: "name",
          label: "Program name",
          required: true,
          placeholder: "e.g. MSc Artificial Intelligence",
        },
        {
          fields: [
            {
              id: "degree_type",
              label: "Degree type",
              options: [
                { value: "", label: "Select" },
                ...DEGREE_TYPES.map((dt) => ({ value: dt.toLowerCase(), label: dt })),
              ],
            },
            {
              id: "field",
              label: "Field",
              placeholder: "e.g. Computer Science",
            },
          ],
        },
        {
          fields: [
            {
              id: "intake_term",
              label: "Intake term",
              options: [
                { value: "", label: "Select" },
                { value: "fall", label: "Fall" },
                { value: "spring", label: "Spring" },
                { value: "winter", label: "Winter" },
                { value: "other", label: "Other" },
              ],
            },
            {
              id: "intake_year",
              label: "Intake year",
              type: "number",
              defaultValue: 2027,
              min: 2020,
              max: 2035,
            },
          ],
        },
        {
          fields: [
            {
              id: "duration_months",
              label: "Duration (months)",
              type: "number",
              placeholder: "e.g. 24",
              min: 1,
            },
            {
              id: "delivery_mode",
              label: "Delivery mode",
              options: [
                { value: "", label: "Select" },
                { value: "on_campus", label: "On campus" },
                { value: "hybrid", label: "Hybrid" },
                { value: "online", label: "Online" },
                { value: "other", label: "Other" },
              ],
            },
          ],
        },
        {
          id: "program_url",
          label: "Program URL",
          type: "url",
          placeholder: "https://...",
        },
        {
          id: "display_priority",
          label: "Priority (1-5)",
          type: "number",
          defaultValue: 3,
          min: 1,
          max: 5,
        },
        {
          id: "research_notes",
          label: "Research notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this program...",
        },
      ]}
    />
  );
}
