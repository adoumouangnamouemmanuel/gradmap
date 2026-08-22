# GradMap Changelog

All notable changes to this project will be documented in this file.

---

## Phase 0 — Preflight and implementation contract

**Date:** 2026-08-22
**Status:** ✅ Complete

### Completed

- [x] Read AGENTS.md and all specifications (PRODUCT_REQUIREMENTS, DATA_MODEL, ARCHITECTURE, ROADMAP, SECURITY, UI_DESIGN_SYSTEM)
- [x] Inspect repository and Git state (brand new repo, no git init yet)
- [x] Verify Node.js and pnpm versions
- [x] Research current stable Next.js App Router, Proxy, PWA/Web Push APIs
- [x] Research current stable Supabase SSR Auth, getClaims, MFA, RLS, Storage, Cron APIs
- [x] Research current stable shadcn/ui CLI/components and Tailwind integration
- [x] Decide exact pinned package versions
- [x] Confirm pnpm and Node runtime
- [x] Establish project commands
- [x] Create implementation decision log (DECISIONS.md)

### In Progress

- [ ] Initialize git repository
- [ ] One commit per file

### Pending

(none — all Phase 0 research tasks complete)

---

## Key Findings

### Runtime

| Tool | Version |
|------|---------|
| Node.js | v24.19.0 |
| pnpm | 10.33.2 |
| Supabase CLI | needs install |

### Pinned Package Versions

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.3.2 | Latest stable, App Router with proxy.ts |
| @supabase/supabase-js | 2.112.3 | Latest stable |
| @supabase/ssr | 0.12.4 | Latest stable, SSR cookie helpers |
| tailwindcss | 4.3.3 | Tailwind v4 (CSS-first config) |
| @tailwindcss/postcss | 4.3.3 | Tailwind v4 PostCSS plugin |
| shadcn | 4.19.0 | Latest CLI and component registry |
| zod | 4.4.3 | Latest stable (v4) |
| vitest | 4.1.11 | Latest stable |
| playwright | 1.62.1 | Latest stable |
| web-push | 3.6.7 | VAPID push notifications |
| supabase (CLI) | 2.115.0 | Latest stable CLI |

### Verified API Patterns

1. **Next.js `proxy.ts`** — replaces `middleware.ts` for Supabase session refresh (current convention as of v16)
2. **`supabase.auth.getClaims()`** — preferred over `getSession()` for server-side identity verification; validates JWT signature against JWKS
3. **`@supabase/ssr` `createBrowserClient` / `createServerClient`** — standard SSR client creation using cookie handlers
4. **PWA manifest** — `app/manifest.ts` with `MetadataRoute.Manifest` type
5. **Web Push** — `web-push` npm package with VAPID keys, service worker registered via `navigator.serviceWorker.register()`
6. **Supabase API key rename** — docs now reference `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (was `anon key`)
