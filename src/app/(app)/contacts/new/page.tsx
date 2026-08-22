"use client";

import { useRouter } from "next/navigation";
import { CreatePage } from "@/components/domain/create-page";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <CreatePage
      title="Add contact"
      backHref="/contacts"
      backLabel="Contacts"
      submitLabel="Add contact"
      action={async (formData) => {
        const { createContact } = await import("@/features/essays/actions");
        const name = formData.get("name") as string;
        await createContact({
          name,
          email: formData.get("email") as string || undefined,
          phone: formData.get("phone") as string || undefined,
          role: formData.get("role") as string || undefined,
          institution: formData.get("institution") as string || undefined,
          notes: formData.get("notes") as string || undefined,
        });
        router.push("/contacts");
      }}
      requiredFields={{ name: "Name is required" }}
      fields={[
        {
          id: "name",
          label: "Name",
          required: true,
          placeholder: "e.g. Dr. Marie Curie",
        },
        {
          fields: [
            {
              id: "email",
              label: "Email",
              type: "email",
              placeholder: "contact@university.fr",
            },
            {
              id: "phone",
              label: "Phone",
              type: "tel",
              placeholder: "+33 1 23 45 67 89",
            },
          ],
        },
        {
          fields: [
            {
              id: "role",
              label: "Role",
              placeholder: "e.g. Admissions Officer",
            },
            {
              id: "institution",
              label: "Institution",
              placeholder: "e.g. University of Lille",
            },
          ],
        },
        {
          id: "notes",
          label: "Notes",
          kind: "textarea",
          rows: 3,
          placeholder: "Notes about this contact...",
        },
      ]}
    />
  );
}
