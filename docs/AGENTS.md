# AGENTS.md - GradMap

These instructions apply to every agent working in this repository. They are mandatory unless Emmanuel explicitly changes them.

## Mission

Build and maintain GradMap: Emmanuel Adoum's secure, visually exceptional, installable command center for graduate-program and scholarship applications for the 2027 intake.

The application exists to reduce application risk and cognitive load. Engineering work must help Emmanuel submit stronger applications on time; it must not become a distracting software experiment.

## Instruction precedence

1. Explicit current user instruction
2. This `AGENTS.md`
3. `docs/SECURITY.md`
4. `docs/PRODUCT_REQUIREMENTS.md`
5. `docs/DATA_MODEL.md`
6. `docs/ARCHITECTURE.md`
7. `docs/UI_DESIGN_SYSTEM.md`
8. `docs/ROADMAP.md`

When two specifications genuinely conflict, stop and report the exact conflict. Do not silently choose the easier interpretation.

## Non-negotiable priorities

### Security is P0

- Treat all application data and uploaded files as private.
- Deny by default.
- Enable RLS on every table in an exposed schema.
- Every policy must enforce ownership, not merely `TO authenticated`.
- Mandatory TOTP MFA protects application data and Storage at `aal2`.
- Never expose a secret key, service-role credential, VAPID private key or cron secret to the browser.
- Never use user-editable metadata for authorization.
- Never create a public Storage bucket for application files.
- Never store application-portal passwords or payment-card details.
- Never cache authenticated HTML, JSON, Supabase responses or document blobs in a service worker/CDN.
- Never weaken a database policy to fix an application error.
- Every new data path requires authorization tests.

### Visual quality is P0

- The app must look designed, not assembled.
- shadcn/ui is the component foundation, not the finished visual identity.
- Follow `docs/UI_DESIGN_SYSTEM.md` and reuse tokens and primitives.
- Every screen must have a clear primary action, hierarchy, responsive layout, complete states and accessible focus behavior.
- Do not ship generic card grids, arbitrary colors, tiny text, placeholder charts, uneven spacing or desktop screens squeezed onto mobile.
- Validate core screens at 390, 768, 1024 and 1440 pixels.

### Correctness and recoverability are P0

- Dates, status changes, deadlines, reminders, document versions and submission history must be trustworthy.
- Store instants as UTC `timestamptz`; present them in the configured timezone.
- Mutations must surface success/failure clearly and avoid partial silent state.
- Critical records require export paths and safe deletion confirmations.

## Locked scope

- Online-first; no offline data layer or synchronization engine.
- Installable PWA with Web Push.
- Personal/invite-only first release; no teams, billing or public registration.
- Supabase is the backend platform.
- In-app and Web Push notifications are required; email reminders are optional after the core system is reliable.
- AI recommendations, scraping and automatic application submission are out of scope.

## Technical baseline

- Next.js App Router, strict TypeScript and pnpm.
- Tailwind CSS and shadcn/ui with accessible primitives.
- Supabase Auth/Postgres/Storage/Cron/Edge Functions.
- Zod at trust boundaries.
- Vitest and Playwright.
- SQL migrations and generated Supabase TypeScript types are committed.

The specification was written against current Next.js 16-era documentation. Verify stable APIs before implementation. Use `proxy.ts` when that is the current Next.js convention; do not paste obsolete `middleware.ts` examples. Use current `@supabase/ssr` browser/server client patterns.

Pin dependency versions and commit `pnpm-lock.yaml`. Do not introduce a dependency for behavior that can be implemented clearly with the platform or existing stack. Document the reason for every substantial new runtime dependency.

## Repository workflow

Before editing:

1. Read relevant specifications completely.
2. Inspect `git status` and preserve unrelated user changes.
3. Search the codebase before creating parallel abstractions.
4. Confirm installed package and CLI versions; use official documentation for version-sensitive APIs.
5. State the acceptance criteria being implemented.

While editing:

- Prefer small, reviewable vertical slices.
- Keep types and validation schemas near domain boundaries without duplicating conflicting definitions.
- Use Server Components by default and narrow Client Components.
- Keep privileged code in server-only modules.
- Return typed domain errors; do not expose stack traces or provider errors to users.
- Update tests and documentation in the same change.
- Preserve accessibility semantics and keyboard behavior.

After editing:

- Format, lint, type-check and run relevant tests.
- Build the application for production when routing, environment or bundling changes.
- For database changes, apply from a clean local reset, generate types and run advisors.
- For UI changes, inspect responsive screenshots and interactive states.
- For security changes, run the abuse/negative tests, not just valid-user flows.
- Report any unverified behavior explicitly.

## Next.js and rendering rules

- Authenticated routes are dynamic and private; do not use ISR for them.
- Initialize Supabase server clients inside each request scope, never module-global.
- On the server, validate identity with `getClaims()` or the current official verified equivalent. Do not authorize from an unverified session object.
- Route handlers must validate method, content type, origin where applicable, auth, input and authorization.
- Redirect targets and notification deep links must be internal allowlisted paths.
- Use `next/font` for self-hosted optimized fonts.
- Define security headers centrally and test them.
- Avoid hydration-dependent layout jumps.
- Use error boundaries, route-level loading states and not-found states intentionally.

## Supabase rules

### Migrations

- All schema, RLS, function, trigger, bucket and scheduled-job changes must be reproducible from committed migrations/configuration.
- Discover CLI syntax with `supabase --help`; do not guess version-sensitive commands.
- Use lowercase snake_case identifiers.
- Use `timestamptz`, `numeric` for money, explicit checks, indexed foreign keys and intentional delete behavior.
- PostgreSQL does not support `ADD CONSTRAINT IF NOT EXISTS`; write valid migrations.
- Do not use rigid Postgres enums for frequently changing workflow values; use text and check constraints.
- Generate database types after schema changes.

### RLS

- Add `user_id` to every user-owned table and index it.
- Prefer separate policies for select/insert/update/delete so intent is reviewable.
- Wrap stable auth functions: `(select auth.uid())`.
- Insert uses `WITH CHECK`.
- Update uses both `USING` and `WITH CHECK` and requires an applicable select policy.
- Delete uses `USING`.
- Ownership-aware composite foreign keys should prevent linking a user's row to another user's parent where the data model specifies them.
- MFA-restricted tables add a restrictive `aal2` policy.
- Views in exposed schemas must use `security_invoker = true` or be inaccessible to public API roles.

### Elevated privileges

- Public clients use only the publishable key.
- Secret/service keys are server-only and limited to narrowly defined workers/administration.
- `SECURITY DEFINER` is prohibited as a permission-error workaround.
- Any exceptional internal `SECURITY DEFINER` function must live outside exposed schemas, use `set search_path = ''`, validate caller/identity, have public execute revoked, and receive a focused security test.

### Storage

- `application-files` is private.
- Object paths start with the authenticated user's UUID.
- Policies cover select, insert, update and delete; upsert requires select+insert+update.
- Prefer non-upsert versioned paths so existing evidence is not silently overwritten.
- Use authenticated download or short-lived signed URLs.
- Delete files through the Storage API.
- Restrict MIME types and file size at bucket and application layers.
- Never accept HTML, SVG, script or executable uploads in the MVP.

## Authentication and MFA

- Production sign-up is disabled after the owner account is provisioned.
- Email/password is the primary login.
- Implement recovery redirects safely and allowlist exact production/development URLs.
- MFA enrollment, challenge, verification and factor management must be complete before enforcing `aal2` data access.
- Losing the authenticator is a real recovery risk: document owner recovery through the Supabase dashboard and maintain protected recovery procedures; do not implement insecure security questions.
- Sign-out clears local application state and invalidates the active session through Supabase.

## PWA and notification rules

- PWA installability does not authorize offline business-data caching.
- Manifest includes correct name, short name, theme colors, standalone display and 192/512/maskable icons.
- Service worker handles installation shell and Web Push only; it excludes auth, API, Supabase and document traffic from runtime caches.
- Request notification permission only after the user presses an explicit enable action.
- Store a separate push subscription per device and allow devices to be disabled.
- Push payloads default to privacy-safe wording.
- A notification link may open only an allowlisted internal route.
- Reminder dispatch is idempotent. Duplicate cron invocations must not duplicate notifications.
- Record attempts and expire invalid subscriptions.

## UI implementation rules

- Use semantic design tokens; do not hardcode scattered colors.
- Use a typography scale and spacing rhythm from `docs/UI_DESIGN_SYSTEM.md`.
- Support light, dark and system themes without contrast regressions.
- Desktop uses a refined collapsible sidebar; mobile uses bottom navigation and context sheets.
- Use data tables on wide screens and purpose-built list cards on small screens when tables become unusable.
- Forms use persistent labels, helpful descriptions and field-level errors. Placeholders are not labels.
- Destructive actions are visually distinct and require confirmation.
- Empty states teach the next action; loading states preserve layout.
- Avoid modals for long multi-field workflows; use pages or drawers as specified.
- Charts need text alternatives and tooltips.
- Honor `prefers-reduced-motion`.

## Data and privacy rules

- Do not log essay bodies, document URLs, push subscription secrets, access tokens or personally sensitive notes.
- Audit/activity records describe the action and entity, not the confidential content.
- Sanitize filenames and user-facing rich text. The MVP uses plain text/Markdown, not arbitrary HTML.
- Bulk export and destructive deletion require an `aal2` session and explicit confirmation.
- Soft archive normal planning entities where recovery is useful. File deletion and account erasure must clearly explain permanence.

## Testing minimums

### Unit/integration

- Date and timezone conversion.
- Deadline urgency and reminder occurrence generation.
- Status transitions and progress calculations.
- Input schemas and upload validation.
- Internal deep-link allowlisting.
- Notification idempotency.

### Database/security

- Anonymous CRUD denial for every private table.
- Owner CRUD success within policy.
- Cross-user read, insert, update, delete and foreign-key-link denial.
- AAL1 denial and AAL2 success for protected tables and Storage.
- Private bucket listing/read/upload/update/delete policy behavior.
- View/function privilege review.

### End-to-end

- Login, MFA enrollment/challenge and logout.
- Create institution/program/application and see dashboard update.
- Add scholarship and associate it with a program.
- Add deadline/task/reminder and receive an in-app notification.
- Enable push on a supported installed PWA and open the correct deep link.
- Upload, preview/download, version and delete a private document.
- Connect a document version to an application requirement.
- Track an essay and recommendation request.
- Export data.
- Responsive navigation and keyboard operation.

## Definition of done

A task is done only when:

- It meets the documented acceptance criteria.
- Security policies and negative tests exist where data is involved.
- UI states and responsive behavior are complete.
- Accessibility is preserved.
- Tests and build pass.
- Documentation is updated.
- No secret, temporary bypass, mock-only critical path or unexplained TODO remains.

## Explicit anti-patterns

Do not:

- Build the entire product in one unverified generation.
- Replace real authorization with hidden navigation.
- Use localStorage for auth or confidential application data.
- Query with elevated keys from client code.
- Disable RLS during normal app operation.
- Put user files in `/public` or a public bucket.
- Make every page a card grid.
- use color alone to communicate status.
- Add offline synchronization, Redux, microservices, queues or an ORM without demonstrated need.
- Introduce AI features before the core tracker is reliable.
- Mark work complete because it compiles.

When in doubt, choose the smaller secure implementation that preserves the exceptional user experience and the September 2026 application-readiness goal.
