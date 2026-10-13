"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveWritingRevision } from "./editor-actions";

export function EssayEditor({
  id,
  initialContent,
  wordLimit,
  characterLimit,
}: {
  id: string;
  initialContent: string;
  wordLimit: number | null;
  characterLimit: number | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [baseline, setBaseline] = useState(initialContent);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const router = useRouter();
  const dirty = content !== baseline;
  const words = content.trim() ? content.trim().split(/\s+/u).length : 0;
  const characters = Array.from(content).length;
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const result = await saveWritingRevision(id, content, notes);
      if (result.error) setError(result.error);
      else {
        setBaseline(content);
        setSaved(true);
        setNotes("");
        router.refresh();
      }
    } catch {
      setError("The connection was interrupted. Your draft is still in this editor.");
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <section className="workspace-panel p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Your working draft</h2>
        <p className="text-muted-foreground text-xs">
          {dirty ? "Unsaved changes" : "Latest saved text"}
        </p>
      </div>
      <label htmlFor="essay-content" className="sr-only">
        Essay content
      </label>
      <textarea
        id="essay-content"
        value={content}
        disabled={pending}
        onChange={(event) => {
          setContent(event.target.value);
          setSaved(false);
        }}
        rows={18}
        className="bg-card w-full resize-y rounded-2xl border p-5 text-base leading-8"
        placeholder="Start shaping your story…"
      />
      <div className="text-muted-foreground my-4 flex flex-wrap gap-4 text-xs">
        <span>
          {words.toLocaleString()} words{wordLimit ? ` / ${wordLimit.toLocaleString()}` : ""}
        </span>
        <span>
          {characters.toLocaleString()} characters
          {characterLimit ? ` / ${characterLimit.toLocaleString()}` : ""}
        </span>
        {(wordLimit && words > wordLimit) || (characterLimit && characters > characterLimit) ? (
          <span className="text-destructive">
            Over the submission limit — you can still preserve this draft.
          </span>
        ) : null}
      </div>
      <label htmlFor="essay-notes" className="mb-2 block text-sm font-medium">
        Revision note <span className="text-muted-foreground">(optional)</span>
      </label>
      <Input
        id="essay-notes"
        disabled={pending}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="What changed in this version?"
      />
      {error && (
        <div role="alert" className="bg-destructive/10 text-destructive mt-4 rounded-xl p-3 text-sm">
          <p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => router.refresh()}>Refresh saved history</Button>
        </div>
      )}
      {saved && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm">
          <CheckCircle2 size={15} />
          Revision saved. Earlier versions are preserved.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={pending || !content.trim() || (!dirty && !notes)}>
          <Save size={16} />
          {pending ? "Saving revision…" : "Save a new revision"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Save a revision to keep your work. Unsaved changes stay in this tab.
        </p>
      </div>
    </section>
  );
}
