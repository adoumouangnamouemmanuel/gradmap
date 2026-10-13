import Link from "next/link";
import {
  BookOpen,
  Award,
  FileText,
  Users,
  Settings,
  Building2,
  GraduationCap,
  PenTool,
  Wallet,
} from "lucide-react";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";

const sections = [
  {
    title: "Applications",
    items: [
      {
        href: "/programs",
        label: "Programs",
        icon: GraduationCap,
        subtitle: "Browse and manage programs",
      },
      {
        href: "/applications",
        label: "Applications",
        icon: FileText,
        subtitle: "Track application status",
      },
      {
        href: "/scholarships",
        label: "Scholarships",
        icon: Award,
        subtitle: "Funding opportunities",
      },
    ],
  },
  {
    title: "Writing & People",
    items: [
      { href: "/essays", label: "Essays", icon: PenTool, subtitle: "Essay prompts and versions" },
      {
        href: "/recommenders",
        label: "Recommenders",
        icon: Users,
        subtitle: "Recommendation letter writers",
      },
      {
        href: "/contacts",
        label: "Contacts",
        icon: Users,
        subtitle: "People you've connected with",
      },
      {
        href: "/documents",
        label: "Documents",
        icon: BookOpen,
        subtitle: "Uploads and file vault",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        href: "/settings/profile",
        label: "Profile",
        icon: Wallet,
        subtitle: "Account and financials",
      },
      { href: "/settings", label: "Settings", icon: Settings, subtitle: "App preferences" },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="animate-content-enter mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">More</h1>
      </div>

      <div className="max-w-lg space-y-8">
        {sections.map((section, sIdx) => (
          <div
            key={section.title}
            className="animate-content-enter"
            style={{ animationDelay: `${sIdx * 80}ms` }}
          >
            <p className="text-muted-foreground/50 mb-2 px-4 text-[11px] font-semibold tracking-wider uppercase">
              {section.title}
            </p>
            <GroupedList>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <MobileListItem
                    title={item.label}
                    subtitle={item.subtitle}
                    indicator={
                      <div className="bg-primary/[0.08] text-primary/60 flex h-[30px] w-[30px] items-center justify-center rounded-[8px]">
                        <item.icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                      </div>
                    }
                  />
                </Link>
              ))}
            </GroupedList>
          </div>
        ))}
      </div>
    </div>
  );
}
