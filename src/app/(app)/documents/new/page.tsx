import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createDocument } from "@/features/documents/actions";
import { redirect } from "next/navigation";

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

async function handleCreateDocument(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const document_type = formData.get("document_type") as string;
  const notes = formData.get("notes") as string;
  const doc = await createDocument({ name, document_type, notes: notes || undefined });
  redirect(`/documents/${doc.id}`);
}

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/documents"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Documents
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add a document</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreateDocument} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Document name *
              </label>
              <Input id="name" name="name" required placeholder="e.g. Bachelor Transcript" />
            </div>

            <div className="space-y-1">
              <label htmlFor="document_type" className="text-sm font-medium">
                Document type
              </label>
              <select id="document_type" name="document_type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this document..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create document</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/documents">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
