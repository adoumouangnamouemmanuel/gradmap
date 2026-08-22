"use client";

import { getPrograms } from "@/features/programs/actions";
import { CreatePage } from "@/components/domain/create-page";
import { APPLICATION_STATUSES } from "@/lib/constants";
import * as React from "react";

export default function NewApplicationPage() {
  const [programs, setPrograms] = React.useState<any[]>([]);

  React.useEffect(() => {
    getPrograms().then(setPrograms);
  }, []);

  return (
    <CreatePage
      title="New application"
      backHref="/applications"
      backLabel="Applications"
      submitLabel="Create application"
      action={async (formData) => {
        const { createApplicationFromForm } = await import("@/features/programs/form-actions");
        await createApplicationFromForm(formData);
      }}
      requiredFields={{
        program_id: "Please select a program",
      }}
      fields={[
        {
          id: "program_id",
          label: "Program",
          required: true,
          options: [
            { value: "", label: "Select a program" },
            ...programs.map((program: any) => ({
              value: program.id,
              label: `${program.name} — ${program.institutions?.name || "Unknown institution"}`,
            })),
          ],
          hint: programs.length === 0
            ? "No programs found. Create one first."
            : undefined,
        },
        {
          fields: [
            {
              id: "status",
              label: "Status",
              options: APPLICATION_STATUSES.map((s) => ({
                value: s,
                label: s.replace(/_/g, " "),
              })),
            },
            {
              id: "priority",
              label: "Priority (1-5)",
              type: "number",
              defaultValue: 3,
              min: 1,
              max: 5,
            },
          ],
        },
        {
          fields: [
            {
              id: "application_round",
              label: "Application round",
              placeholder: "e.g. Main, Early",
            },
            {
              id: "portal_url",
              label: "Portal URL",
              type: "url",
              placeholder: "https://...",
            },
          ],
        },
        {
          id: "notes",
          label: "Notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this application...",
        },
      ]}
    />
  );
}
