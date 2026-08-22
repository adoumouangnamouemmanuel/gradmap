"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreatePage } from "@/components/domain/create-page";
import { createDocument } from "@/features/documents/actions";

const DOCUMENT_TYPES = [
  { value: "transcript", label: "Transcript" },
  { value: "diploma", label: "Diploma" },
  { value: "cv", label: "CV / Resume" },
  { value: "passport", label: "Passport" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "english_test", label: "English Test (TOEFL/IELTS)" },
  { value: "motivation_letter", label: "Motivation Letter" },
  { value: "research_proposal", label: "Research Proposal" },
  { value: "portfolio", label: "Portfolio" },
  { value: "other", label: "Other" },
];

export default function NewDocumentPage() {
  const router = useRouter();

  return (
    <CreatePage
      title="Add a document"
      backHref="/documents"
      backLabel="Documents"
      submitLabel="Create document"
      action={async (formData) => {
        const name = formData.get("name") as string;
        const document_type = formData.get("document_type") as string;
        const notes = formData.get("notes") as string;
        const doc = await createDocument({ name, document_type, notes: notes || undefined });
        router.push(`/documents/${doc.id}`);
      }}
      requiredFields={{ name: "Document name is required" }}
      fields={[
        {
          id: "name",
          label: "Document name",
          required: true,
          placeholder: "e.g. Bachelor Transcript",
        },
        {
          id: "document_type",
          label: "Document type",
          options: DOCUMENT_TYPES.map((dt) => ({ value: dt.value, label: dt.label })),
        },
        {
          id: "notes",
          label: "Notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this document...",
        },
      ]}
    />
  );
}
