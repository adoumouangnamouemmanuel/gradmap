# Connected workspace upgrade

This change builds on the revised Overview/shell design with shared creation forms, study preferences, a real calendar, preparation collections, safer revision handling, and pagination. It uses existing React, Radix, Framer Motion, Zod and Supabase dependencies. No environment variables or dependencies were added.

## Database deployment

Migrations `00009`–`00013` were applied to the logged-in GradMap Supabase project on 2026-10-13 through its SQL editor and recorded in `supabase_migrations.schema_migrations`. Existing profile, application and document record counts were preserved. The 13 study-profile columns and five owner-scoped RPCs were verified; the new RPCs deny anonymous execution. PostgREST’s schema cache was refreshed.

For another environment, back up its database, inspect its migration history, and apply these migrations in order. New columns are additive. Owner/context constraints are `NOT VALID`: existing data is retained, but a legacy conflicting row may need explicit correction before a later update. Unique constraints and indexes acquire table locks; deploy during a suitable maintenance window for a large database. The dashboard deployment used a short lock timeout and transactional migration/history writes.

Rollback the application first if necessary; retaining additive profile fields preserves user preferences. Do not drop populated columns or revision history as a casual rollback. Remove new functions/triggers/constraints only through a reviewed follow-up migration and preserve the original owner policies. Restore the previous function body through a new migration rather than editing an applied migration.

`src/types/database.ts` was manually synchronized for profile fields and RPC signatures. Regenerate the complete database types against the migrated project when authenticated CLI access is available; browser login is not CLI authentication.

## UX and integrity

- Creation forms filter programs by institution, clear dependent selections, prevent duplicate submissions, and show missing-parent creation links. Reusable items remain independent where appropriate.
- Profile preferences are optional and structured for future matching. No LLM, crawler, automatic submission, recommendation messaging, or eligibility inference runs.
- Calendar dates use the selected IANA timezone. Invalid dates and daylight-saving gaps/ambiguities are rejected. Dated work loads by the visible month; writing/recommendation tasks follow their application context.
- Document requirements attach a specific matching file version. Uploads validate type, extension, signature, size and owner before storing immutable private versions. Signed downloads expire after 60 seconds and use private/no-store responses.
- Revision allocation/current pointers/audit events commit atomically. Drafts can exceed submission limits, but final/submitted writing cannot. Unicode whitespace is counted consistently without altering the saved text.
- An uncertain upload response preserves its file and checks for committed metadata before cleanup. After a writing connection failure, refresh saved history before retrying. These flows do not claim exactly-once retries.
- Collections search/filter/page on the server, returning 24 safe metadata records. Extra application sections page independently. Calendar grouping avoids repeated array copies, timezone formatters are bounded and reused, and bundled fonts avoid build-time Google-font downloads.

## Verification commands

The package declares pnpm. Equivalent direct Node commands were used here because the machine’s npm shim was unavailable:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run
node node_modules/next/dist/bin/next build
node node_modules/eslint/bin/eslint.js <changed source paths>
node node_modules/prettier/bin/prettier.cjs --check <new and updated UI source paths>
.\scripts\test-database.ps1
```

The database script requires native PostgreSQL tools on PATH. It starts a disposable loopback-only database under the system temporary directory, applies every migration, tests owner isolation/context constraints/limits/file matching/pagination, races two writing saves, and stops the server in `finally`. Diagnostic files remain outside the repository. `supabase/tests/native_bootstrap.sql` is a minimal test fixture: **never run it on an existing or hosted database**. It does not reproduce the real Supabase Storage service or MFA configuration.

## Practical limits

Creation choices and the requirement file picker are bounded at 500 records and show a limit notice. Collection pagination can browse beyond that bound, but a future remote-search picker is needed for larger prerequisite libraries. Calendar categories are bounded per month and its undated fetch is bounded; a limit notice is shown. Some older edit/catalog paths retain legacy controls and query helpers.

Browser checks cover the live empty collections, prerequisite/validation states, searchable choices, profile availability, theme opacity, calendar navigation, and responsive layouts. Real file uploads, populated multi-page browser flows, full MFA/Storage policy behavior, and formal Lighthouse/Web Vitals measurements need separate verification. The local SQL tests cover populated pagination and owner isolation without creating test records in the hosted account.

Provider references checked during implementation: [database function security](https://supabase.com/docs/guides/database/functions), [inclusive range pagination](https://supabase.com/docs/reference/javascript/range), and [server authentication/client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## Changed files

The inventory below includes the earlier workspace appearance changes retained in this task. No files were moved or renamed. The two removed creation forms were replaced by the shared entry flow and had no remaining references.
