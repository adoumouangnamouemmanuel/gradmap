import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";

export function AuthShell({
  children,
  eyebrow = "YOUR NEXT CHAPTER",
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <main
      className="relative min-h-[100svh] overflow-x-hidden overflow-y-auto bg-[#18231f] bg-cover bg-center text-[#1d211f] dark:text-[#f4f5f1]"
      style={{ backgroundImage: "url('/auth-neutral.svg')" }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 mx-auto min-h-[100svh] max-w-[1600px] p-4 sm:p-10 lg:p-14">
        <section className="hidden min-h-[calc(100vh-7rem)] flex-col justify-between text-white lg:flex">
          <Link
            href="/login"
            className="flex items-center gap-3 text-[21px] font-semibold tracking-tight"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#63b8a5] text-[#10231f] shadow-lg shadow-black/20">
              <Compass size={23} strokeWidth={1.8} />
            </span>
            GradMap
          </Link>

          <div className="max-w-md">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-white/65">
              {eyebrow}
            </p>
            <h1 className="max-w-sm font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
              Your next chapter starts here.
            </h1>
            <p className="mt-3 text-sm text-white/65">A calmer way to plan what comes next.</p>
          </div>

          <p className="text-xs text-white/45">Private workspace · GradMap</p>
        </section>

        <section className="relative flex min-h-[calc(100svh-2rem)] items-center justify-center py-2 sm:min-h-[calc(100svh-5rem)] sm:py-0 lg:absolute lg:inset-0 lg:items-center lg:justify-end lg:px-14">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <Link
                href="/login"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#24463b] text-white">
                  <Compass size={17} />
                </span>
                GradMap
              </Link>
              <Link href="/login" className="text-sm text-white/75 hover:text-white">
                Sign in <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
