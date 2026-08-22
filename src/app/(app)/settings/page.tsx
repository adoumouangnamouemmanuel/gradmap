import { Settings } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={logout}>
              <Button type="submit" variant="destructive">Sign out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
