# GradMap implementation roadmap

This roadmap is organized as AI-assisted vertical slices, not traditional multi-week estimates. Each phase ends with a usable, verified checkpoint. The agent may complete several phases in one working session only when all gates are actually run and recorded.

## Delivery strategy

- **First usable checkpoint:** end of Phase 3. Emmanuel can securely track real programs/applications/deadlines.
- **Complete private application workspace:** end of Phase 6.
- **Installable reminders experience:** end of Phase 7.
- **Production release:** end of Phase 9.

Security and design are built throughout. They are not final polish phases.

## Global phase gate

Before marking any phase complete:

- Relevant acceptance criteria pass.
- UI works at 390px and 1440px at minimum; full viewport matrix for major milestones.
- Loading, empty, error and success states exist.
- New data paths have owner/cross-user/anonymous tests.
- Formatting, lint, type-check and targeted tests pass.
- Documentation and generated types are current.
- No secret, bypass or unexplained critical TODO remains.

---

## Phase 0 - Preflight and implementation contract ✅ COMPLETE

### Goal

Create a reproducible foundation and eliminate version/API ambiguity before feature generation.

### Work

1. ✅ Read `AGENTS.md` and all specifications.
2. ✅ Inspect repository, Git state and existing code.
3. ✅ Verify current stable official guidance for:
   - Next.js App Router, Proxy and PWA/Web Push.
   - Supabase SSR Auth, `getClaims`, RLS, Storage and Cron/Edge Functions.
   - Current shadcn/ui CLI/components and Tailwind integration.
4. ✅ Decide exact pinned package versions and record them (see DECISIONS.md).
5. ✅ Confirm pnpm 10.33.2 and Node.js v24.19.0.
6. ✅ Establish commands: format, lint, typecheck, unit, E2E, build and Supabase.
7. ✅ Create implementation decision log (docs/DECISIONS.md, D-001 through D-009).

### Acceptance

- ✅ Agent can state the exact version-sensitive patterns it will use.
- ✅ No existing user work is overwritten.
- ✅ The execution plan maps every requirement to a phase.
- ✅ Environment/secrets contract is understood; no real secret is committed.

---

## Phase 1 - Beautiful shell and PWA foundation ✅ COMPLETE

### Goal

Establish the visual identity, responsive shell and installability skeleton before domain screens multiply.

### Work

1. ✅ Scaffold current stable Next.js App Router with strict TypeScript, pnpm, Tailwind and shadcn/ui.
2. ✅ Configure linting, formatting, testing and path aliases.
3. ✅ Implement semantic tokens, fonts (Geist Sans/Serif + Newsreader), light/dark/system themes and core layout primitives.
4. ✅ Build public shell, polished login screen placeholders, desktop sidebar, top utility bar and mobile bottom navigation.
5. ✅ Add `PageHeader`, `StatusBadge`, `DeadlineIndicator`, `Metric`, `EmptyState`, `DataToolbar`, `MobileListItem` and state primitives.
6. ✅ Implement representative populated and empty dashboard mock states using fixture data only.
7. ✅ Create manifest, icons/placeholder mark, theme metadata, standalone behavior and neutral offline-required page.
8. ✅ Register a minimal service worker that does not cache private/app/API content. Push arrives in Phase 7.
9. ⬜ Add visual/accessibility tests for shell and theme.

### Acceptance

- App can be installed in a supported development/preview environment.
- Dashboard shell looks purpose-built, not default shadcn.
- Navigation is excellent at 390, 768, 1024 and 1440px.
- Dark/light contrast and focus behavior pass review.
- Service worker exclusions prove no user/API data caching.
- Production build succeeds.

### Do not add yet

- Real application data.
- Offline database/synchronization.
- Decorative charts without defined metrics.

---

## Phase 2 - Supabase foundation, authentication and authorization harness ✅ COMPLETE

### Goal

Create the secure backend boundary before real private data enters the app.

**Note:** TOTP MFA is removed from scope per D-009. Authentication uses email/password only. RLS enforces owner-based access without MFA-restrictive policies.

### Work

1. ✅ Initialize Supabase CLI (2.115.0) and local environment (supabase/config.toml).
2. ✅ Implement SSR browser/server clients and current Next.js Proxy session pattern.
3. ✅ Implement login, logout, callback, recovery and reset flows.
4. ~~Implement TOTP enrollment, challenge, verification and factor settings.~~ **Removed per D-009.**
5. ✅ Create profiles and notification-preferences migrations with RLS.
6. ✅ Establish reusable migration/RLS patterns and test helpers for anonymous, owner and other-user.
7. ✅ Disable/plan production public registration and document owner provisioning.
8. ✅ Configure dynamic/no-store authenticated routes and security headers/CSP baseline.
9. ✅ Add environment validation that fails safely on missing values (Zod).
10. ✅ Generate and commit database types.

### Acceptance

- ✅ Owner can sign in and reach an empty authenticated shell.
- ✅ Anonymous protected navigation redirects without data leakage.
- ✅ Owner can query a protected fixture table; other user cannot.
- ✅ Recovery redirects reject external/open targets.
- ✅ No elevated key is present in client bundle.
- ✅ Authenticated responses are private/no-store.
- ✅ Clean local Supabase reset and build pass.

### Security stop condition

Do not proceed to private domain data until the RLS negative-test harness is working.

---

## Phase 3 - First usable vertical slice: program to deadline to dashboard ✅ COMPLETE

### Goal

Let Emmanuel begin entering real application targets immediately.

### Work

1. ✅ Migrate institutions, programs, program evaluations, applications, application status history, deadlines and tasks.
2. ✅ Add constraints, ownership-aware foreign keys, indexes, grants and RLS policies with each table.
3. ✅ Implement institution/program creation, edit, list, detail, archive and filters.
4. ✅ Implement program evaluation and transparent weighted score.
5. ✅ Implement program application create/detail/status change.
6. ✅ Implement deadlines and tasks linked to the application.
7. ✅ Replace fixture dashboard with real queries:
   - Next best action.
   - Seven-/thirty-day deadline horizon.
   - Pipeline counts.
   - Blocking tasks/readiness starter.
8. ⬜ Implement first-use onboarding to create the first program.
9. ✅ Add activity events for major status/mutation actions without confidential content.

### Acceptance

- ✅ Emmanuel can create a real institution → program → application → deadline/task chain.
- ✅ Dashboard updates immediately and explains urgency/progress.
- ✅ Source URL and verified date are available for deadlines.
- ✅ Status history is accurate.
- ✅ Cross-user links and CRUD fail at the database layer (RLS).
- ✅ Mobile program/application detail is fully usable.
- ✅ All global phase gates pass.

### Milestone

**GradMap is now safe and useful enough to begin the September 2026 shortlist.** Do not delay real data entry for later optional features.

---

## Phase 4 - Scholarships, funding, expenses and decisions 🔄 IN PROGRESS

### Goal

Make scholarship targeting-especially high-priority opportunities such as Eiffel-equal to admission tracking.

### Work

1. ✅ Migrate scholarships, program-scholarship links, scholarship applications and expenses.
2. ✅ Implement eligibility, mechanism, coverage, amount/currency, obligations and verification fields.
3. ✅ Link scholarships to compatible programs.
4. ✅ Implement separate scholarship application pipeline and program-application association.
5. ⬜ Add scholarship deadlines/tasks through canonical planning flows.
6. ✅ Implement expense tracking with exact currencies and fee states.
7. ✅ Build funding comparison and dashboard outlook without guessed FX conversion.
8. ✅ Enhance decision/offer fields and response-deadline display.

### Acceptance

- ✅ Eiffel can be entered as data, linked to programs and tracked without hardcoded special-case code.
- ✅ Automatic, nomination and separate-application mechanisms render correctly.
- ✅ Amount/currency constraints reject invalid combinations.
- ✅ Funding dashboard traces to source records.
- ⬜ User isolation tests cover every new table/relation.

---

## Phase 5 - Private document vault and application requirements

### Goal

Securely organize every application file and the exact version submitted to each requirement.

### Work

1. Create private `application-files` bucket and reproducible Storage policies.
2. Migrate documents, document versions and document requirements.
3. Implement upload validation: allowed type, extension, size, filename, magic bytes where practical and SHA-256.
4. Implement owner-scoped versioned path generation.
5. Implement standard upload up to 6 MB and current resumable approach above 6 MB, capped at 20 MB.
6. Build document library, upload state, secure preview/download, version timeline, current-version control and archive/delete flows.
7. Link exact document versions to program/scholarship application requirements.
8. Implement readiness/expiry/needs-update indicators on dashboard/application.
9. Add cleanup handling for partial database/Storage failures.

### Acceptance

- Anonymous, other user and AAL1 cannot list/read/upload/update/delete objects.
- AAL2 owner can complete each valid Storage operation.
- No public URL is generated; signed URLs are short-lived and not stored.
- Disallowed/mismatched/oversized/path-manipulated uploads fail safely.
- Submitted requirement remains linked to its exact version when a newer document version becomes current.
- Referenced-version deletion is blocked or requires a safe explicit replacement/unlink flow.
- Private files are excluded from caches/logs.

### Security stop condition

Do not use production Storage until policy tests pass against two test users and anonymous access.

---

## Phase 6 - Essays, recommenders and contacts

### Goal

Complete the human/material preparation workflow around each application.

### Work

1. Migrate essay prompts/versions, recommenders, recommendation requests, contacts and contact interactions.
2. Build essay prompt/detail/editor with word/character limits, saved-state clarity and immutable versions.
3. Render safe text/Markdown with raw HTML disabled.
4. Build recommender workload view, request tracking and due/follow-up tasks.
5. Build contacts and interaction timeline linked to institutions/programs.
6. Update application readiness with essay/recommendation blockers.
7. Add sensitive-content logging tests.

### Acceptance

- Essay versions cannot silently overwrite one another.
- Word/character counts and status rules are correct.
- Malicious HTML/Markdown test content cannot execute.
- Recommendation request requires exactly one application context.
- Recommender deadline/workload views work on mobile and desktop.
- Contact history never claims an external message was sent by GradMap.
- Cross-user isolation passes for all records.

---

## Phase 7 - Reliable reminders, Web Push and installed-phone experience

### Goal

Deliver dependable reminders while the application is closed and make the installed PWA feel complete.

### Work

1. Migrate reminders, notifications, push subscriptions and delivery attempts.
2. Generate VAPID keys through the current official workflow; store private key server-only.
3. Implement explicit device permission/subscription UX and device management.
4. Extend service worker for push and notification click.
5. Implement internal route allowlisting.
6. Implement in-app notification center.
7. Implement atomic/idempotent due-reminder claiming.
8. Implement protected scheduled dispatcher/Edge Function and Supabase Cron invocation with secrets in Vault/server configuration.
9. Implement retries, failure categorization and invalid-subscription disabling.
10. Respect quiet hours and notification privacy setting.
11. Add test-notification flow.
12. Provide iOS/Android/desktop install and notification guidance.

### Acceptance

- One scheduled occurrence creates one in-app notification even under duplicate concurrent invocations.
- Push reaches at least one supported desktop browser and one supported installed mobile PWA flow.
- Permission denial leaves the rest of the app functional.
- Expired subscriptions disable cleanly.
- Notification content is privacy-safe by default.
- Malicious/external deep link is rejected.
- Unauthorized cron call cannot dispatch.
- Service worker still caches no private data.

---

## Phase 8 - Command-center views, search and data portability

### Goal

Make the complete dataset fast to navigate, compare and recover.

### Work

1. Implement global command search and quick add.
2. Complete application table/board and mobile grouped views.
3. Complete calendar month/agenda views with filters.
4. Implement program and offer comparison views.
5. Implement server-side filtering and cursor pagination where justified.
6. Add owner JSON export and useful CSV exports.
7. Add settings for scoring weights, timezone, reminders, privacy and devices.
8. Complete archive/restore views.

### Acceptance

- Search returns only owner-authorized records and handles no-result/error states.
- Board has keyboard/status-menu alternative to drag behavior.
- Calendar is readable at 390px and 1440px.
- Export requires AAL2 and contains no auth/push secrets, signed URLs or confidential platform internals.
- A complete structured export can be parsed and is documented.

---

## Phase 9 - Security hardening, visual refinement and production release

### Goal

Prove that GradMap is secure, beautiful, reliable and recoverable before real production use.

### Work

1. Run the complete `SECURITY.md` test matrix.
2. Run Supabase Security/Performance Advisors and resolve relevant findings.
3. Verify grants, RLS, views, functions, Storage policies and secrets.
4. Verify CSP, HSTS, `nosniff`, referrer, permissions and frame protections.
5. Scan browser bundles/source maps and Git for forbidden secret material.
6. Validate authenticated/private no-store behavior and service-worker cache contents.
7. Execute complete responsive visual QA in light/dark themes.
8. Fix Lighthouse accessibility/best-practice findings; target accessibility ≥95.
9. Test slow connection, upload failure, expired session, reminder retry and provider outage states.
10. Run clean migration reset, generated types, full unit/E2E/build suite.
11. Configure production Supabase/Vercel values, exact redirects, owner account and disabled registration.
12. ~~Enroll owner MFA and test recovery procedure.~~ **Removed per D-009.**
13. Test production PWA installation, push and deep links.
14. Produce setup, user, backup/export and recovery documentation.

### Production release gate

- [ ] All Must requirements pass.
- [ ] No unresolved P0/P1 security issue.
- [ ] Anonymous/cross-user tests all deny correctly.
- [ ] Private Storage operations tested end-to-end.
- [ ] Reminder duplication and unauthorized invocation tests pass.
- [ ] No secret is client-visible or committed.
- [ ] Required responsive screens approved in light/dark.
- [ ] Accessibility target met or every remaining finding fixed before release.
- [ ] Clean build and migrations succeed.
- [ ] Export and recovery tested.
- [ ] Owner can enter the first real target unaided.

---

## Post-release backlog - only after real use exposes need

- Optional email reminders with custom provider/SMTP.
- Calendar export/subscription.
- CSV import with validation preview.
- Exchange-rate snapshots with explicit sources.
- More advanced offer comparison.
- Shared advisor access with a deliberately redesigned authorization model.
- Native app only if PWA limitations become material.
- AI/research assistance only after privacy, source provenance and product value are separately specified.

These items must not delay the September 2026 application workflow.

## Recommended agent checkpoint report

After every phase, report:

```text
Phase:
Outcome:
Key files changed:
Database migrations/policies:
Tests run and results:
Responsive/visual verification:
Security negative tests:
Known risks or deferred items:
Next phase:
```
