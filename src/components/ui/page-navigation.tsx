"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { pageBounds } from "@/lib/pagination";
type NavigationProps = { page: number; total: number; pageSize?: number; pending?: boolean; label?: string } & ({ onChange: (page: number) => void; links?: never } | { links: { previous: string; next: string }; onChange?: never });
export function PageNavigation({ page, total, pageSize = 24, onChange, links, pending = false, label = "Pagination" }: NavigationProps) {
  const bounds = pageBounds(total, page, pageSize);
  if (total <= pageSize) return null;
  function control(next: boolean) {
    const disabled = pending || (next ? bounds.page === bounds.pages : bounds.page === 1);
    const content = next ? <>Next<ChevronRight size={15} /></> : <><ChevronLeft size={15} />Previous</>;
    return links && !disabled ? <Button asChild variant="outline" size="sm"><Link href={next ? links.next : links.previous} aria-label={next ? "Next page" : "Previous page"}>{content}</Link></Button> : <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onChange?.(bounds.page + (next ? 1 : -1))} aria-label={next ? "Next page" : "Previous page"}>{content}</Button>;
  }
  return <nav aria-label={label} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"><p role="status" className="text-xs text-muted-foreground">{bounds.start}–{bounds.end} of {total} · Page {bounds.page} of {bounds.pages}</p><div className="flex gap-2">{control(false)}{control(true)}</div></nav>;
}
