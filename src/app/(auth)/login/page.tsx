import { login, signup, magicLink } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-serif font-bold text-lg">
            G
          </div>
          <CardTitle className="font-serif text-2xl">Welcome to GradMap</CardTitle>
          <CardDescription>
            Your path to the next chapter, clearly organized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error/Message display */}
          <div id="auth-messages" />

          {/* Email/Password Login */}
          <form action={login} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" placeholder="Your password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            <a href="/reset-password" className="underline hover:text-foreground">Forgot password?</a>
          </div>

          <Separator />

          {/* Magic Link */}
          <form action={magicLink} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="magic-email" className="text-sm font-medium">Or sign in with magic link</label>
              <Input id="magic-email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <Button type="submit" variant="outline" className="w-full">Send magic link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
