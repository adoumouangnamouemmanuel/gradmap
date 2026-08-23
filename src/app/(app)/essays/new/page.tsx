"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreatePage } from "@/components/domain/create-page";
import { getApplications } from "@/features/programs/actions";

export default function NewEssayPromptPage() {
  const router = useRouter();
  const [applications, setApplications] = React.useState<any[]>([]);

  React.useEffect(() => {
    getApplications().then(setApplications);
  }, []);

  return (
    <CreatePage
      title="Add essay prompt"
      backHref="/essays"
      backLabel="Essays"
      submitLabel="Create prompt"
      action={async (formData) => {
        const { createEssayPrompt } = await import("@/features/essays/actions");
        const title = formData.get("title") as string;
        const essay = await createEssayPrompt({
          title,
          prompt_text: formData.get("prompt_text") as string || undefined,
          word_limit: Number(formData.get("word_limit")) || undefined,
          character_limit: Number(formData.get("character_limit")) || undefined,
          application_id: formData.get("application_id") as string || undefined,
          notes: formData.get("notes") as string || undefined,
        });
        router.push(`/essays/${essay.id}`);
      }}
      requiredFields={{ title: "Title is required" }}
      fields={[
        {
          id: "title",
          label: "Title",
          required: true,
          placeholder: "e.g. Statement of Purpose",
        },
        {
          id: "prompt_text",
          label: "Prompt text",
          kind: "textarea",
          rows: 4,
          placeholder: "The full prompt text...",
        },
        {
          fields: [
            {
              id: "word_limit",
              label: "Word limit",
              type: "number",
              placeholder: "e.g. 500",
              min: 1,
            },
            {
              id: "character_limit",
              label: "Character limit",
              type: "number",
              placeholder: "e.g. 3000",
              min: 1,
            },
          ],
        },
        {
          id: "application_id",
          label: "Link to application",
          options: [
            { value: "", label: "No linked application" },
            ...applications.map((app: any) => ({
              value: app.id,
              label: `${app.programs?.name} - ${app.status}`,
            })),
          ],
        },
      ]}
    />
  );
}
