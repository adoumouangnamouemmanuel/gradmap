"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchSelect } from "@/components/ui/search-select";
import { ESSAY_STATUSES, ESSAY_STATUS_LABELS } from "@/lib/constants";
import { changeWritingStatus } from "./editor-actions";
export function EssayStatus({ id, status }: { id: string; status: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div>
      <SearchSelect
        name="essay_stage"
        label="Writing stage"
        value={status}
        disabled={pending}
        options={ESSAY_STATUSES.map((value) => ({ value, label: ESSAY_STATUS_LABELS[value] }))}
        onChange={async (value) => {
          setPending(true);
          setError("");
          try {
            const result = await changeWritingStatus(id, String(value));
            if (result.error) setError(result.error);
            else router.refresh();
          } catch {
            setError("The stage couldn’t save. Please try again.");
          } finally {
            setPending(false);
          }
        }}
      />
      {error && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      )}
      <p className="text-muted-foreground mt-3 text-xs">
        Final and submitted stages require a saved revision within its limits.
      </p>
    </div>
  );
}
