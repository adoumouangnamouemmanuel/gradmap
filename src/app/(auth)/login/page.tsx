import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login, signInWithGoogle } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell>
      <div className="rounded-[2rem] border border-black/[0.07] bg-white/75 p-6 shadow-[0_24px_80px_rgba(42,55,45,0.12)] backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#557364] dark:text-emerald-300/80">
              WELCOME BACK
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em]">Welcome back.</h2>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#e7f0e4] text-[#315b46] sm:flex dark:bg-emerald-500/15 dark:text-emerald-300">
            <LockKeyhole size={18} />
          </div>
        </div>
        {params.error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {decodeURIComponent(params.error)}
          </div>
        )}
        {params.message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {decodeURIComponent(params.message)}
          </div>
        )}
        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="border-border/70 text-foreground hover:bg-muted h-12 w-full rounded-xl bg-white dark:bg-white/5"
          >
            <span className="mr-2 text-base font-semibold text-[#4285F4]">G</span>
            Continue with Google
          </Button>
        </form>
        <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          <span>or continue with email</span>
          <span className="bg-border h-px flex-1" />
        </div>
        <form action={login} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <PasswordInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="bg-background/60 h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#315b46] hover:underline dark:text-emerald-300"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
              className="bg-background/60 h-12 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#24463b] text-white hover:bg-[#1c392f]"
          >
            Sign in <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <p className="text-muted-foreground mt-7 border-t pt-6 text-center text-sm">
          New to GradMap?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#315b46] hover:underline dark:text-emerald-300"
          >
            Create your workspace
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
