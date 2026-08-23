import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Plus, Clock, Trash2 } from "lucide-react";
import { getContact, createContactInteraction, archiveContact } from "@/features/essays/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INTERACTION_TYPES = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "video_call", label: "Video call" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let contact;
  try {
    contact = await getContact(id);
  } catch {
    notFound();
  }

  const interactions = (contact.contact_interactions || [])
    .sort((a: any, b: any) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/contacts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {contact.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {contact.role && `${contact.role} · `}
          {contact.institution || ""}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {contact.phone}
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Interaction Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Interaction Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {interactions.length > 0 ? (
                <div className="space-y-3">
                  {interactions.map((interaction: any) => (
                    <div key={interaction.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(interaction.happened_at).toLocaleDateString()} · {interaction.interaction_type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{interaction.summary}</p>
                      {interaction.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{interaction.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 mb-4">
                  No interactions recorded yet.
                </p>
              )}

              {/* New interaction form */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Log interaction
                </p>
                <form action={async (formData: FormData) => {
                  "use server";
                  await createContactInteraction({
                    contact_id: id,
                    interaction_type: formData.get("interaction_type") as string || "email",
                    summary: formData.get("summary") as string,
                    happened_at: formData.get("happened_at") as string || undefined,
                    notes: formData.get("notes") as string || undefined,
                  });
                }} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select name="interaction_type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      {INTERACTION_TYPES.map((it) => (
                        <option key={it.value} value={it.value}>{it.label}</option>
                      ))}
                    </select>
                    <Input name="happened_at" type="datetime-local" />
                  </div>
                  <Input name="summary" required placeholder="e.g. Discussed research opportunities" />
                  <Input name="notes" placeholder="Additional notes (optional)" />
                  <Button type="submit" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Log interaction
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={async () => { "use server"; await archiveContact(id); }}>
                <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Archive contact
                </Button>
              </form>
            </CardContent>
          </Card>
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
