import { updatePassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Reset password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePassword} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">New password</label>
              <Input id="password" name="password" type="password" placeholder="At least 6 characters" required minLength={6} />
            </div>
            <Button type="submit" className="w-full">Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
