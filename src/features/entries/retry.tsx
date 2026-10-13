"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function EntryRetry({ href }: { href: string }) {
  const router = useRouter();
  return (
    <div className="workspace-page">
      <section className="workspace-panel max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Your choices couldn’t load.</h1>
        <p role="alert" className="text-muted-foreground my-4 text-sm">
          Check your connection and try again. We haven’t treated this as an empty list.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.refresh()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href={href}>Back to workspace</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
