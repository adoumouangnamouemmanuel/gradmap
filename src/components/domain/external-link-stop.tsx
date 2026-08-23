"use client";

import { ExternalLink } from "lucide-react";

export function ExternalLinkStop({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <span
      role="link"
      tabIndex={0}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <ExternalLink className="h-3 w-3" />
    </span>
  );
}
