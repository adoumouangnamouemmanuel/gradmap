import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login, signInWithGoogle } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthForm, PendingButton } from "@/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell>
      <div className="rounded-[1.5rem] border border-black/[0.07] bg-white/75 p-5 shadow-[0_24px_80px_rgba(42,55,45,0.12)] backdrop-blur-xl sm:rounded-[2rem] sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#557364] dark:text-emerald-300/80">
              WELCOME BACK
            </p>
            <h2 className="mt-2 font-serif text-2xl tracking-[-0.035em] sm:mt-3 sm:text-3xl">
              Welcome back.
            </h2>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#e7f0e4] text-[#315b46] sm:flex dark:bg-emerald-500/15 dark:text-emerald-300">
            <LockKeyhole size={18} />
          </div>
        </div>
        {params.error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {decodeURIComponent(params.error)}
          </div>
        )}
        {params.message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {decodeURIComponent(params.message)}
          </div>
        )}
        <form action={signInWithGoogle}>
          <PendingButton
            type="submit"
            variant="outline"
            className="text-foreground h-12 w-full rounded-xl border-[#d8ded9] bg-white font-medium shadow-[0_1px_2px_rgba(22,45,31,0.04)] transition-colors hover:border-[#b9c9bd] hover:bg-[#f7faf7] dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/10"
          >
            <svg aria-hidden="true" className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"
                fill="#4285F4"
              />
              <path
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.29v2.53A9.74 9.74 0 0 0 12 21.5Z"
                fill="#34A853"
              />
              <path
                d="M6.53 13.57a5.86 5.86 0 0 1 0-3.14V7.9H3.29a9.5 9.5 0 0 0 0 8.2l3.24-2.53Z"
                fill="#FBBC05"
              />
              <path
                d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.4l3.24 2.53C7.3 8.11 9.46 6.39 12 6.39Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </PendingButton>
        </form>
        <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs sm:my-6">
          <span className="bg-border h-px flex-1" />
          <span>or continue with email</span>
          <span className="bg-border h-px flex-1" />
        </div>
        <AuthForm
          action={login}
          className="space-y-4 sm:space-y-5"
          submit={
            <>
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </>
          }
          submitClassName="h-11 w-full rounded-xl bg-[#24463b] text-white hover:bg-[#1c392f] sm:h-12"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="bg-background/60 h-11 rounded-xl sm:h-12"
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
            <PasswordInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
              className="bg-background/60 h-11 rounded-xl sm:h-12"
            />
          </div>
        </AuthForm>
        <p className="text-muted-foreground mt-6 border-t pt-5 text-center text-sm sm:mt-7 sm:pt-6">
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
