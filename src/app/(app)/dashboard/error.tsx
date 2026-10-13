"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="workspace-page">
      <div className="workspace-panel mx-auto max-w-lg p-8 text-center">
        <h1 className="font-serif text-3xl">Let’s try that again.</h1>
        <p className="text-muted-foreground my-4 text-sm leading-relaxed">
          We couldn’t load your workspace. Check your connection and try again.
        </p>
        <Button onClick={reset}>
          <RefreshCw size={16} /> Reload workspace
        </Button>
      </div>
    </div>
  );
}
