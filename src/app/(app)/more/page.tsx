import Link from "next/link";
import { BookOpen, Award, FileText, Users, Settings, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";

const moreItems = [
  { href: "/essays", label: "Essays", icon: FileText, description: "Coming in Phase 6" },
  { href: "/recommenders", label: "Recommenders", icon: Users, description: "Coming in Phase 6" },
  { href: "/contacts", label: "Contacts", icon: Users, description: "Coming in Phase 6" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Account and preferences" },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="More" description="Additional sections and settings." />
      <div className="mt-6 space-y-2">
        {moreItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
