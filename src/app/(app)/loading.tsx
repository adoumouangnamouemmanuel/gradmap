export default function WorkspaceLoading() {
  return <div className="workspace-page" role="status" aria-label="Loading this workspace"><div className="mb-7 h-24 w-2/3 rounded-2xl bg-muted motion-safe:animate-pulse" /><div className="grid gap-5 md:grid-cols-2"><div className="h-80 rounded-3xl bg-muted motion-safe:animate-pulse" /><div className="h-80 rounded-3xl bg-muted motion-safe:animate-pulse" /></div><span className="sr-only">Loading your saved records…</span></div>;
}
