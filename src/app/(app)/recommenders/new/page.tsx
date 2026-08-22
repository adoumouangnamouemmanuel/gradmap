"use client";

import { useRouter } from "next/navigation";
import { CreatePage } from "@/components/domain/create-page";

export default function NewRecommenderPage() {
  const router = useRouter();

  return (
    <CreatePage
      title="Add recommender"
      backHref="/recommenders"
      backLabel="Recommenders"
      submitLabel="Add recommender"
      action={async (formData) => {
        const { createRecommender } = await import("@/features/essays/actions");
        const name = formData.get("name") as string;
        await createRecommender({
          name,
          email: formData.get("email") as string || undefined,
          title: formData.get("title") as string || undefined,
          institution: formData.get("institution") as string || undefined,
          relationship: formData.get("relationship") as string || undefined,
          notes: formData.get("notes") as string || undefined,
        });
        router.push("/recommenders");
      }}
      requiredFields={{ name: "Name is required" }}
      fields={[
        {
          id: "name",
          label: "Name",
          required: true,
          placeholder: "e.g. Prof. Jean Dupont",
        },
        {
          fields: [
            {
              id: "email",
              label: "Email",
              type: "email",
              placeholder: "professor@university.fr",
            },
            {
              id: "title",
              label: "Title",
              placeholder: "e.g. Professor of Computer Science",
            },
          ],
        },
        {
          fields: [
            {
              id: "institution",
              label: "Institution",
              placeholder: "e.g. University of Lille",
            },
            {
              id: "relationship",
              label: "Relationship",
              placeholder: "e.g. Thesis supervisor",
            },
          ],
        },
        {
          id: "notes",
          label: "Notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this recommender...",
        },
      ]}
    />
  );
}
