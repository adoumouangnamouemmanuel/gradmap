"use client";

import { createInstitutionFromForm } from "@/features/programs/form-actions";
import { CreatePage } from "@/components/domain/create-page";
import { COUNTRIES } from "@/lib/constants";

export default function NewInstitutionPage() {
  return (
    <CreatePage
      title="Add an institution"
      backHref="/institutions"
      backLabel="Institutions"
      submitLabel="Create institution"
      action={(formData) => createInstitutionFromForm(formData)}
      successHref="/programs/new"
      requiredFields={{ name: "Institution name is required" }}
      fields={[
        {
          id: "name",
          label: "Institution name",
          required: true,
          placeholder: "e.g. University of Lille",
        },
        {
          fields: [
            {
              id: "country_name",
              label: "Country",
              options: [
                { value: "", label: "Select country" },
                ...COUNTRIES.map((c) => ({ value: c, label: c })),
              ],
            },
            {
              id: "city",
              label: "City",
              placeholder: "e.g. Lille",
            },
          ],
        },
        {
          id: "website_url",
          label: "Website URL",
          type: "url",
          placeholder: "https://...",
        },
        {
          id: "notes",
          label: "Notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this institution...",
        },
      ]}
    />
  );
}
