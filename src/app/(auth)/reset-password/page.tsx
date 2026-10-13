import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { updatePassword } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell eyebrow="A FRESH START">
      <div className="rounded-[2rem] border border-black/[0.07] bg-white/75 p-6 shadow-[0_24px_80px_rgba(42,55,45,0.12)] backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f0e4] text-[#315b46] dark:bg-emerald-500/15 dark:text-emerald-300">
          <KeyRound size={25} strokeWidth={1.7} />
        </div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#557364] dark:text-emerald-300/80">
          NEW PASSWORD
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em]">Choose a new password.</h2>
        {params.error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {decodeURIComponent(params.error)}
          </div>
        )}
        <form action={updatePassword} className="mt-7 space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="bg-background/60 h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-sm font-medium">
              Confirm new password
            </label>
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              required
              minLength={8}
              className="bg-background/60 h-12 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#24463b] text-white hover:bg-[#1c392f]"
          >
            Update password <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground mt-7 block text-center text-sm font-medium"
        >
          Return to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
