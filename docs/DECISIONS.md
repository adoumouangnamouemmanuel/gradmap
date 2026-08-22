# GradMap implementation decisions

This log records justified deviations from specifications and version-sensitive implementation decisions made during Phase 0. Each entry explains **what** was decided, **why**, and **when** it should be revisited.

---

## D-001: `proxy.ts` instead of `middleware.ts`

**Date:** 2026-08-22
**Category:** Next.js routing
**Decision:** Use `src/proxy.ts` (or `src/app/proxy.ts` depending on project layout) for Supabase session refresh instead of the legacy `middleware.ts` pattern.
**Rationale:** The current Supabase SSR documentation and Next.js 16 App Router convention use a `proxy` export, not middleware. The `proxy.ts` file calls `updateSession()` from `@supabase/ssr`, which handles cookie refresh. This is the officially recommended pattern as of `@supabase/ssr@0.12.x` + Next.js 16.
**Spec deviation:** The ARCHITECTURE.md references "Proxy" but does not explicitly name `proxy.ts`. This aligns intent with current API.
**Revisit:** If Next.js reverts or renames this convention.

---

## D-002: `getClaims()` as primary server-side identity verification

**Date:** 2026-08-22
**Category:** Authentication
**Decision:** Always use `supabase.auth.getClaims()` on the server to verify identity. Never trust `getSession()` for authorization decisions.
**Rationale:** `getClaims()` validates the JWT signature against the project's published public keys (via WebCrypto + cached JWKS for asymmetric keys, the default for new Supabase projects). `getSession()` reads from local storage without re-validation. The Supabase docs explicitly state: "It's safe to trust getClaims() because it validates the JWT signature."
**Spec deviation:** ARCHITECTURE.md says "check verified claims" — this pins the exact method.
**Revisit:** If Supabase changes the default signing key algorithm.

---

## D-003: Tailwind v4 CSS-first configuration

**Date:** 2026-08-22
**Category:** Styling
**Decision:** Use Tailwind CSS v4 with CSS-first configuration (`@import "tailwindcss"` in CSS, `@theme` blocks) instead of the legacy `tailwind.config.js` approach.
**Rationale:** Tailwind v4 (4.3.3) uses a new CSS-first configuration model. The `@tailwindcss/postcss` plugin (4.3.3) integrates with Next.js via PostCSS. shadcn/ui v4 (4.19.0) is designed for this setup.
**Spec deviation:** UI_DESIGN_SYSTEM.md specifies Tailwind but does not pin a version. This locks to v4 conventions.
**Revisit:** If shadcn/ui releases a major version with different Tailwind requirements.

---

## D-004: Supabase API key naming

**Date:** 2026-08-22
**Category:** Environment variables
**Decision:** Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (current docs convention) instead of the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
**Rationale:** The current Supabase SSR documentation references "publishable key" as the standard name. The env.example already uses this naming. The underlying value is the same publishable/anon key.
**Spec deviation:** None — env.example already matches.
**Revisit:** If Supabase reverts naming.

---

## D-005: Zod v4

**Date:** 2026-08-22
**Category:** Validation
**Decision:** Use Zod 4.4.3 (latest stable) instead of Zod v3.
**Rationale:** Zod v4 is the current latest stable release. The API is largely backward-compatible for basic validation patterns. If v4 introduces breaking changes for our use cases, pin to 3.x instead.
**Spec deviation:** AGENTS.md specifies "Zod at trust boundaries" without pinning a version.
**Revisit:** After first migration/test cycle — if v4 causes issues with shadcn/ui or other integrations, fall back to `zod@^3.23`.

---

## D-006: `src/` directory structure

**Date:** 2026-08-22
**Category:** Project structure
**Decision:** Use `src/` directory for application code, matching the ARCHITECTURE.md suggested structure.
**Rationale:** The ARCHITECTURE.md explicitly shows `src/app/`, `src/components/`, etc. This separates application source from config files at root level.
**Spec deviation:** None — aligned with ARCHITECTURE.md.
**Revisit:** Never.

---

## D-007: One migration per domain table group

**Date:** 2026-08-22
**Category:** Database migrations
**Decision:** Group related tables into single migration files (e.g., institutions + programs + program_evaluations in one migration) rather than one table per migration file.
**Rationale:** DATA_MODEL.md specifies migration order by domain group. Grouping keeps related schema changes atomic and reduces migration file count. Each migration leaves the database secure at its end (RLS enabled, grants applied).
**Spec deviation:** None — aligned with DATA_MODEL.md §17 migration order.
**Revisit:** If migration complexity exceeds comfortable review size.

---

## D-008: Vitest over Jest

**Date:** 2026-08-22
**Category:** Testing
**Decision:** Use Vitest 4.1.11 as the unit/integration test runner.
**Rationale:** AGENTS.md specifies "Vitest and Playwright." Vitest is native to the Vite ecosystem, has excellent Next.js integration, and is faster than Jest for TypeScript projects. Playwright handles E2E.
**Spec deviation:** None — explicitly specified in AGENTS.md.
**Revisit:** Never.

---

## D-009: MFA enforcement deferred to Phase 2

**Date:** 2026-08-22
**Category:** Authentication / Security
**Decision:** Do not enforce TOTP MFA (aal2) on protected data in Phase 1. The visual shell, PWA foundation, theme system and layout primitives will function without authentication or at AAL1 only. MFA enrollment, challenge, verification and restrictive RLS policies will be implemented in Phase 2.
**Rationale:** Phase 1 is purely visual/UI work — no real application data exists yet. Enforcing MFA would block all development and testing of the shell. The security stop condition in the roadmap ("Do not proceed to private domain data until the RLS/MFA negative-test harness is working") applies to Phase 3, not Phase 1.
**Spec deviation:** ROADMAP Phase 1 does not explicitly mention MFA, but AGENTS.md states MFA is required for application data. This deferral is limited to Phase 1 only — Phase 2 must complete MFA before Phase 3 begins.
**Revisit:** Phase 2 is mandatory. No private domain data (Phase 3+) may proceed without working MFA + RLS tests.
