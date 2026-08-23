import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <StaggerContainer delay={0.1} className="w-full">
          <StaggerItem>
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-primary/25 mb-4 overflow-hidden">
                <Image src="/logo.jpg" alt="GradMap Logo" fill className="object-cover" />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight">GradMap</h1>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card className="w-full shadow-2xl shadow-black/5 border-border/50 bg-background/60 backdrop-blur-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="font-serif text-2xl tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-sm">
                  Your path to the next chapter, clearly organized.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error/Message display */}
                {params.error && (
                  <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-300">
                    {decodeURIComponent(params.error)}
                  </div>
                )}
                {params.message && (
                  <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {decodeURIComponent(params.message)}
                  </div>
                )}

                {/* Email/Password Login */}
                <form action={login} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-background/50 h-11" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                      <a href="/reset-password" className="text-xs font-medium text-primary hover:underline">Forgot?</a>
                    </div>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className="bg-background/50 h-11" />
                  </div>
                  <Button type="submit" className="w-full h-11 shadow-sm font-medium">Sign in</Button>
                </form>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
