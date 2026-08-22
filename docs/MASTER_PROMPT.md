# Master implementation prompt - GradMap

You are the lead product engineer and security-minded design engineer responsible for building **GradMap**, a private, installable graduate-school and scholarship application command center for Emmanuel Adoum's 2027 intake.

Your job is to implement a production-quality application, not a disposable prototype and not a generic admin dashboard.

## First action

Before modifying code:

1. Read `AGENTS.md` completely.
2. Read every file in `docs/` completely in the source-of-truth order defined by `README.md`.
3. Inspect the repository, current branch, package manager, dirty files, installed versions and existing conventions.
4. Check current official Next.js, Supabase and shadcn/ui documentation for any APIs that may have changed. Use the current stable patterns; do not copy obsolete auth-helper, middleware or service-worker examples.
5. Produce a concise implementation plan mapped to `docs/ROADMAP.md`.
6. Begin implementation unless a genuinely blocking decision is missing. Do not ask questions that the specifications already answer.

## Two P0 priorities

### P0-A - Exceptional visual quality

The UI must feel purpose-built, calm, refined and premium. It must not resemble an unmodified shadcn example, a typical SaaS template, or a grid of identical white cards.

Implement the design system in `docs/UI_DESIGN_SYSTEM.md` faithfully:

- Strong academic-editorial identity with excellent typography.
- Intentional information hierarchy and generous but efficient spacing.
- Beautiful light and dark themes.
- Responsive desktop, tablet and phone layouts.
- Mobile bottom navigation, safe-area support and excellent touch targets.
- Purposeful empty, loading, success and error states.
- Subtle, accessible motion that honors reduced-motion preferences.
- Data-dense views remain highly scannable.
- No visual inconsistency, arbitrary colors, excessive borders or decorative clutter.

Visual acceptance is release-blocking. Verify at 390px, 768px, 1024px and 1440px widths. Capture screenshots during QA and correct overflow, hierarchy, alignment, contrast and density problems.

### P0-B - High security and privacy

The application will contain sensitive academic records, essays, contact information and uploaded documents. Security cannot be postponed.

Implement `docs/SECURITY.md` as a requirement:

- Production registration is closed; only the provisioned owner may sign in.
- Supabase SSR uses cookie-based sessions and the current `@supabase/ssr` pattern.
- Server-side protection validates identity with `getClaims()` or the current official equivalent; never trust `getSession()` alone for authorization.
- Mandatory TOTP MFA; data tables and Storage require `aal2` after enrollment.
- RLS on every exposed table with explicit owner predicates.
- Cross-owner references are prevented with ownership-aware constraints where specified.
- Private Storage bucket with owner-folder policies; no public file URL.
- Secrets and elevated keys never reach client bundles.
- Authenticated pages and private API responses are never publicly cached.
- Strong CSP and security headers are configured and tested.
- Inputs, uploads, redirects and notification links are validated.
- Destructive operations require confirmation and secure handling.
- Anonymous, cross-user, file-access and MFA tests must pass before deployment.

If a feature cannot be implemented securely, do not ship an insecure approximation. Record the blocker and keep the feature disabled.

## Product constraints

- The app is online-first. Do **not** build offline data storage, offline mutation queues, conflict resolution or background synchronization.
- It must still be an installable PWA and may cache only static public shell assets required for installation and notification handling.
- Never cache Supabase responses, authenticated HTML, API payloads, document blobs or user data in the service worker.
- Primary timezone defaults to `Africa/Accra`; store instants in UTC and render in the user's configured timezone.
- Target intake is 2027. Do not invent an exact graduation day; the known graduation month is May 2027.
- The initial account is Emmanuel's. Keep the schema ownership-safe so future users are possible, but do not build teams, organizations, public onboarding or billing.
- No portal passwords, payment-card data or third-party credentials may be stored.
- Do not add AI features, scraping or recommendation engines to the MVP.

## Required stack

- Current stable Next.js App Router baseline; the specification was verified against Next.js 16-era `proxy.ts` behavior.
- TypeScript with `strict: true` and no casual `any`.
- pnpm with a committed lockfile.
- Tailwind CSS and shadcn/ui using the current CLI and accessible primitives.
- Supabase Auth, Postgres, private Storage, Cron and Edge Functions.
- `@supabase/supabase-js` and `@supabase/ssr`, pinned to exact installed versions.
- Zod for shared boundary validation.
- React Hook Form for complex client forms where it provides value.
- date-fns or an equivalent small, well-maintained date library.
- Lucide icons.
- Vitest for unit tests and Playwright for end-to-end/security-critical flows.
- Supabase CLI migrations and generated database types.

Use Server Components by default. Add Client Components only for interactive islands. Use Server Actions or Route Handlers for privileged operations; direct client queries are allowed only where RLS is the complete authorization boundary.

## Required capabilities

Build the complete scope in `docs/PRODUCT_REQUIREMENTS.md`, including:

- Secure login, recovery, MFA enrollment, challenge and account security settings.
- Beautiful dashboard with priorities, deadline risk, application progress, funding outlook and document readiness.
- Institutions and graduate programs.
- Scholarships and program–scholarship relationships.
- Program and scholarship application pipelines.
- Deadline verification, tasks and customizable reminders.
- Private document library, requirement matching and version history.
- Essays and essay versions.
- Recommenders, recommendation requests, contacts and interaction history.
- Costs, decisions and outcome comparison.
- Calendar, table and board views where each is materially useful.
- Global search and command palette.
- In-app notifications.
- Installable PWA with opt-in Web Push and notification deep links.
- Secure CSV/JSON export and recovery-oriented backups.

## Notification implementation

Use the flow in `docs/ARCHITECTURE.md`:

1. User creates deadlines/tasks and reminder offsets.
2. Due reminder occurrences are claimed idempotently.
3. A scheduled Supabase job invokes a protected dispatcher/Edge Function.
4. The worker creates an in-app notification and sends Web Push to active device subscriptions.
5. Delivery attempts are recorded without storing sensitive notification content unnecessarily.
6. Expired push subscriptions are disabled.
7. Notification clicks deep-link to an allowlisted internal route.

Push permission must be requested only after an explicit user action. Provide clear iOS installation guidance. Notification payloads must default to privacy-preserving text suitable for a lock screen.

## Storage implementation

- Create one private `application-files` bucket.
- Restrict allowed types to PDF, DOCX, PNG and JPEG unless requirements are intentionally expanded.
- Set a conservative per-file limit; 20 MB is the MVP default.
- Use paths shaped as `{user_id}/{document_id}/{document_version_id}/{safe_filename}`.
- Use authenticated downloads or very short-lived signed URLs.
- Validate MIME type, extension, size and normalized filename.
- Store file metadata and SHA-256 checksum in `document_versions`.
- Delete through the Storage API, never by deleting only `storage.objects` rows.
- Handle partial upload/database failures without orphaning metadata or files.

## Database implementation

- Implement clean SQL migrations in `supabase/migrations/`; do not make undocumented dashboard-only schema changes.
- Use lowercase snake_case identifiers, UUID IDs, `timestamptz`, `numeric` for money, explicit `check` constraints and indexed foreign keys.
- Use text plus check constraints for workflow statuses rather than rigid Postgres enums.
- Include `user_id`, `created_at`, `updated_at` and optional `archived_at` where specified.
- Add indexes for ownership, foreign keys, due-date queries, unread notifications and active reminder dispatch.
- Wrap `auth.uid()` calls in `select` inside RLS policies.
- `UPDATE` policies require both `USING` and `WITH CHECK`, plus the corresponding `SELECT` policy.
- Do not use `user_metadata` for authorization.
- Do not introduce `SECURITY DEFINER` to bypass permission problems. If a narrowly justified internal worker function requires it, keep it outside exposed schemas, set an empty search path, validate the caller, revoke public execute privileges and test it explicitly.
- Run Supabase security and performance advisors and resolve relevant findings.

## Execution method

Implement the roadmap as verified vertical slices. For each phase:

1. State the phase goal and inspect the relevant existing code.
2. Make the smallest coherent set of changes.
3. Add or update tests with the feature.
4. Run formatting, lint, type-check, unit tests and relevant end-to-end tests.
5. For schema phases, reset/apply migrations locally, generate types and run security checks.
6. Review the phase acceptance checklist in `docs/ROADMAP.md`.
7. Report changed files, verification evidence, remaining risks and the next phase.

Do not claim a phase is complete when tests were skipped or when only the happy path works.

## Quality gates

The following commands or their repository equivalents must pass before final handoff:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Also verify:

- Fresh Supabase local reset succeeds from migrations.
- Generated database types are current.
- Anonymous users receive no user rows and no files.
- Test user A cannot read, change or reference user B's resources.
- AAL1 cannot access protected data or private files after MFA enforcement.
- AAL2 can complete allowed operations.
- No service/secret key appears in browser assets.
- PWA installs and launches in standalone mode.
- Web Push works on at least one desktop browser and one supported mobile installed-PWA flow.
- Authenticated responses and file downloads are not cached publicly.
- Lighthouse accessibility and best-practice findings are addressed; target at least 95 for accessibility on core screens.
- Core screens have no horizontal overflow or inaccessible controls at required widths.

## Final handoff

At completion, provide:

- A working deployed application and documented local setup.
- Migration and seed instructions.
- Exact environment-variable inventory.
- Owner-account provisioning and MFA-enrollment instructions.
- PWA installation instructions for Android/desktop and iOS.
- Notification configuration and test instructions.
- Security verification results and known residual risks.
- Backup/export and recovery instructions.
- A concise user guide for Emmanuel's first real application entry.

Begin now by reading the repository instructions and producing the phase plan. Do not generate a superficial one-shot CRUD application.
