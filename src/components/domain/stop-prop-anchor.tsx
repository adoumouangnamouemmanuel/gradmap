"use client";

export function StopPropagationAnchor({
  href,
  target,
  rel,
  className,
  children,
}: {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      role="link"
      tabIndex={0}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(href, target || "_self");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          window.open(href, target || "_self");
        }
      }}
    >
      {children}
    </span>
  );
}
