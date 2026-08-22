export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="font-serif text-2xl font-semibold">You are offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        GradMap requires an internet connection to access your application data.
        Please check your connection and try again.
      </p>
    </main>
  );
}
