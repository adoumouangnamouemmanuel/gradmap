import { Settings, LogOut } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";
import Link from "next/link";
import { FadeIn } from "@/components/ui/motion-wrapper";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <div className="mt-4 space-y-6 max-w-lg">
        <FadeIn delay={0.1}>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-4">Account</p>
          <GroupedList>
            <Link href="/settings/profile">
              <MobileListItem
                title="Profile"
                subtitle="View account details and financial summary"
                indicator={
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-primary/[0.08] text-primary/60">
                    <Settings className="h-[16px] w-[16px]" />
                  </div>
                }
              />
            </Link>
          </GroupedList>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-4">Session</p>
          <GroupedList>
            <form action={logout}>
              <button type="submit" className="w-full">
                <MobileListItem
                  title="Sign out"
                  subtitle="Log out of your account"
                  indicator={
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-destructive/[0.08] text-destructive/60">
                      <LogOut className="h-[16px] w-[16px]" />
                    </div>
                  }
                  showChevron={false}
                />
              </button>
            </form>
          </GroupedList>
        </FadeIn>
      </div>
    </div>
  );
}
