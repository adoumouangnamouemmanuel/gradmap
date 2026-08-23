import Link from "next/link";
import { Plus, Users, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem } from "@/components/domain/mobile-list-item";
import { getContacts } from "@/features/essays/actions";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Contacts"
        description="People you interact with during the application process."
        action={
          <Button asChild>
            <Link href="/contacts/new">
              <Plus className="mr-1 h-4 w-4" />
              Add contact
            </Link>
          </Button>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No contacts yet"
          description="Add professors, admissions officers, and other contacts."
          action={{ label: "Add first contact", href: "/contacts/new" }}
        />
      ) : (
        <>
          <div className="mt-6 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Name</span>
                  <span>Role</span>
                  <span>Contact</span>
                </div>
                {contacts.map((contact: any) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      {contact.institution && (
                        <p className="text-xs text-muted-foreground">{contact.institution}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {contact.role || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      {contact.email && <Mail className="h-3 w-3" />}
                      {contact.phone && <Phone className="h-3 w-3" />}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {contacts.map((contact: any) => (
              <Link key={contact.id} href={`/contacts/${contact.id}`}>
                <MobileListItem
                  title={contact.name}
                  subtitle={contact.role || contact.institution || "No details"}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
