import Link from "next/link";
import { Plus, Users, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/domain/empty-state";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getContacts } from "@/features/essays/actions";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Contacts"
        description="People you interact with during the application process."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/contacts/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Add contact</span>
            </Link>
          </Button>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title="No contacts yet" description="Add professors, admissions officers, and other contacts." action={{ label: "Add first contact", href: "/contacts/new" }} />
      ) : (
        <>
          <div className="mt-4 hidden sm:block">
            <FadeIn delay={0.1}>
              <Card>
                <CardContent className="p-0">
                  {contacts.map((contact: any) => (
                    <Link key={contact.id} href={`/contacts/${contact.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">{contact.name}</p>
                        {contact.institution && <p className="text-[13px] text-muted-foreground">{contact.institution}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[13px] text-muted-foreground">{contact.role || "—"}</span>
                        <span className="flex items-center gap-1 text-muted-foreground/40">
                          {contact.email && <Mail className="h-[14px] w-[14px]" />}
                          {contact.phone && <Phone className="h-[14px] w-[14px]" />}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
          <div className="mt-4 sm:hidden">
            <FadeIn delay={0.1}>
              <GroupedList>
                {contacts.map((contact: any, i: number) => (
                  <Link key={contact.id} href={`/contacts/${contact.id}`}>
                    <MobileListItem index={i} title={contact.name} subtitle={contact.role || contact.institution || "No details"} />
                  </Link>
                ))}
              </GroupedList>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
