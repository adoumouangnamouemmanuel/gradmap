import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default function NewContactPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const { createContact } = await import("@/features/essays/actions");
    const name = formData.get("name") as string;
    if (!name) redirect("/contacts/new?error=Name+is+required");
    await createContact({
      name,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      role: formData.get("role") as string || undefined,
      institution: formData.get("institution") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
    redirect("/contacts");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/contacts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Add contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Name *</label>
              <Input id="name" name="name" required placeholder="e.g. Dr. Marie Curie" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" placeholder="contact@university.fr" />
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input id="phone" name="phone" type="tel" placeholder="+33 1 23 45 67 89" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Input id="role" name="role" placeholder="e.g. Admissions Officer" />
              </div>
              <div className="space-y-1">
                <label htmlFor="institution" className="text-sm font-medium">Institution</label>
                <Input id="institution" name="institution" placeholder="e.g. University of Lille" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                placeholder="Notes about this contact..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Add contact</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/contacts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
