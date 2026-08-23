import Link from "next/link";
import {
  BookOpen, Award, FileText, Users, Settings, Building2,
  GraduationCap, PenTool, Wallet, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="mb-6 animate-apple-fade">
        <h1 className="font-serif text-[28px] sm:text-3xl font-semibold tracking-tight leading-tight">More</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">All sections at a glance.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, sectionIdx) => (
          <div 
            key={section.title} 
            className={cn(
              "animate-apple-slide-up",
              sectionIdx === 0 && "stagger-1",
              sectionIdx === 1 && "stagger-3",
              sectionIdx === 2 && "stagger-5",
            )}
          >
            <h2 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    "transition-colors duration-150",
                    "hover:bg-accent/50 active:bg-accent/70",
                    "press-subtle",
                    itemIdx < section.items.length - 1 && "separator-apple ml-[52px]"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    <item.icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium">{item.label}</p>
                    <p className="text-[13px] text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
