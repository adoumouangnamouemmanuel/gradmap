export default function DashboardLoading() {
  return (
    <div className="workspace-page" role="status" aria-label="Loading your workspace">
      <div className="bg-muted mb-8 h-24 w-2/3 rounded-2xl motion-safe:animate-pulse" />
      <div className="mb-8 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        {[0, 1].map((value) => (
          <div key={value} className="bg-muted h-80 rounded-3xl motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="bg-muted h-72 rounded-2xl motion-safe:animate-pulse" />
      <span className="sr-only">Loading applications and deadlines…</span>
    </div>
  );
}
