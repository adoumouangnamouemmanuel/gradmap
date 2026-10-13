import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { resetPassword } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell eyebrow="A FRESH START">
      <div className="rounded-[2rem] border border-black/[0.07] bg-white/75 p-6 shadow-[0_24px_80px_rgba(42,55,45,0.12)] backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f0e4] text-[#315b46] dark:bg-emerald-500/15 dark:text-emerald-300">
          <Mail size={25} strokeWidth={1.7} />
        </div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#557364] dark:text-emerald-300/80">
          PASSWORD RECOVERY
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em]">Reset your password.</h2>
        {params.error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {decodeURIComponent(params.error)}
          </div>
        )}
        {params.message && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {decodeURIComponent(params.message)}
          </div>
        )}
        <form action={resetPassword} className="mt-7 space-y-5">
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
              className="bg-background/60 h-12 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#24463b] text-white hover:bg-[#1c392f]"
          >
            Send reset link
          </Button>
        </form>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground mt-7 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
