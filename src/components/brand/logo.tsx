import { cn } from "@/lib/utils";

export function LogoMark({ className, title = "GradMap" }: { className?: string; title?: string }) {
  return (
    <svg
      aria-label={title}
      className={cn("shrink-0", className)}
      fill="none"
      role="img"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 8.5A3.5 3.5 0 0 1 13.5 5H34a4 4 0 0 1 4 4v26.5a2.5 2.5 0 0 1-4 2L24 31l-10 6.5a2.5 2.5 0 0 1-4-2V8.5Z"
        fill="currentColor"
        fillOpacity=".13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M16 27.5c2.4-4.9 5.8-7.2 10.2-6.9 3.2.2 5.5-1.1 6.8-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="m31.9 10.7.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showName = true,
}: {
  className?: string;
  markClassName?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-9 w-9", markClassName)} />
      {showName ? <span className="font-semibold tracking-[-0.03em]">GradMap</span> : null}
    </span>
  );
}
