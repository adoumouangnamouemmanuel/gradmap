import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signInWithGoogle, signup } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthForm, PendingButton } from "@/components/auth/auth-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell eyebrow="START WITH CLARITY">
      <div className="rounded-[1.5rem] border border-black/[0.07] bg-white/75 p-5 shadow-[0_24px_80px_rgba(42,55,45,0.12)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7 dark:border-white/10 dark:bg-white/[0.06]">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#557364] dark:text-emerald-300/80">
          CREATE YOUR WORKSPACE
        </p>
        <h2 className="mt-2 font-serif text-2xl tracking-[-0.035em] sm:mt-3 sm:text-3xl">
          Create your workspace.
        </h2>
        {params.error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {decodeURIComponent(params.error)}
          </div>
        )}
        <form action={signInWithGoogle} className="mt-4 sm:mt-5">
          <PendingButton
            type="submit"
            variant="outline"
            className="border-border/70 text-foreground hover:bg-muted h-11 w-full rounded-xl bg-white dark:bg-white/5"
          >
            <span className="mr-2 text-base font-semibold text-[#4285F4]">G</span>
            Continue with Google
          </PendingButton>
        </form>
        <div className="text-muted-foreground my-4 flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          <span>or use email</span>
          <span className="bg-border h-px flex-1" />
        </div>
        <AuthForm
          action={signup}
          className="space-y-3 sm:space-y-4"
          submit={
            <>
              Create my workspace <ArrowRight className="ml-2 h-4 w-4" />
            </>
          }
          submitClassName="mt-2 h-11 w-full rounded-xl bg-[#24463b] text-white hover:bg-[#1c392f]"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-sm font-medium">
                Your name
              </label>
              <Input
                id="full_name"
                name="full_name"
                autoComplete="name"
                placeholder="Emmanuel Adoum"
                className="bg-background/60 h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
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
                className="bg-background/60 h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters"
                required
                minLength={8}
                className="bg-background/60 h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm_password" className="text-sm font-medium">
                Confirm password
              </label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat it"
                required
                minLength={8}
                className="bg-background/60 h-11 rounded-xl"
              />
            </div>
          </div>
        </AuthForm>
        <p className="text-muted-foreground mt-5 pb-1 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#315b46] hover:underline dark:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
