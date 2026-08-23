import Link from "next/link";
import {
  BookOpen, Award, FileText, Users, Settings, Building2,
  GraduationCap, PenTool, Wallet, HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Applications",
    items: [
      { href: "/programs", label: "Programs", icon: GraduationCap, description: "Browse and manage programs" },
      { href: "/applications", label: "Applications", icon: FileText, description: "Track application status" },
      { href: "/scholarships", label: "Scholarships", icon: Award, description: "Funding opportunities" },
      { href: "/institutions", label: "Institutions", icon: Building2, description: "Universities and colleges" },
    ],
  },
  {
    title: "Writing & People",
    items: [
      { href: "/essays", label: "Essays", icon: PenTool, description: "Essay prompts and versions" },
      { href: "/recommenders", label: "Recommenders", icon: Users, description: "Recommendation letter writers" },
      { href: "/contacts", label: "Contacts", icon: Users, description: "People you've connected with" },
      { href: "/documents", label: "Documents", icon: BookOpen, description: "Uploads and file vault" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/settings/profile", label: "Profile", icon: Wallet, description: "Account details and financials" },
      { href: "/settings", label: "Settings", icon: Settings, description: "App preferences" },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">More</h1>
        <p className="mt-1 text-sm text-muted-foreground">All sections at a glance.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
