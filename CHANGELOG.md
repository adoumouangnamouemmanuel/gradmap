# GradMap Changelog

All notable changes to this project will be documented in this file.

---

## Phase 0 - Preflight and implementation contract

**Date:** 2026-08-22
**Status:** ✅ Complete

## Phase 1 - Beautiful shell and PWA foundation

**Date:** 2026-08-22
**Status:** ✅ Complete

## Phase 2 - Supabase foundation, authentication and authorization harness

**Date:** 2026-08-22
**Status:** ✅ Complete

## Phase 5+6 - Documents, essays, recommenders, contacts

**Date:** 2026-08-22
**Status:** In Progress

### Completed

- [x] Create migration for documents, document_versions, document_requirements, essay_prompts, essay_versions, recommenders, recommendation_requests, contacts, contact_interactions
- [x] Create document server actions (CRUD, versions, requirements)
- [x] Create essay/recommender/contact server actions
- [x] Build documents list, new, and detail pages with version history
- [x] Build essays list, new, and detail pages with version management
- [x] Build recommenders list, new, and detail pages with request tracking
- [x] Build contacts list, new, and detail pages with interaction timeline
- [x] Add Essays, Recommenders, Contacts to sidebar navigation

### Pending

- [ ] Apply migration (requires Docker)
- [ ] Generate types from live database
- [ ] Supabase Storage configuration for file uploads
- [ ] Upload validation and signed URL generation
- [ ] Dashboard readiness indicators

---

## Phase 4 - Scholarships, funding, expenses and decisions

**Date:** 2026-08-22
**Status:** ✅ Complete

### Completed

- [x] Fix Supabase ambiguous relationship errors in getPrograms, getApplications, getApplication, getProgram
- [x] Fix EmptyState Server Component onClick error
- [x] Add cursor-pointer to Button component globally
- [x] Fix calendar page to use Link instead of raw `<a>`
- [x] Create Phase 4 migration: scholarships, program_scholarships, scholarship_applications, expenses
- [x] Add decision/offer fields to applications table
- [x] Add FKs from deadlines/tasks to scholarships and scholarship_applications
- [x] Update database TypeScript types for all new tables and altered fields
- [x] Create server actions for scholarships, scholarship applications, expenses, funding summary
- [x] Create shared constants (currencies, countries, funding types, mechanisms, statuses)
- [x] Create institutions list, new, and detail pages
- [x] Add Institutions to sidebar navigation
- [x] Build scholarships list, detail, and new pages with program linking
- [x] Add scholarship-app linking UI on scholarship detail page
- [x] Update applications page to show scholarship applications and expenses
- [x] Add expense creation form on application detail page
- [x] Update dashboard with funding summary section
- [x] Enhance program new form with institution pre-selection
- [x] Standardize currency/funding type/mechanism dropdowns across all forms

### Pending

- [ ] Apply migration (requires Docker)
- [ ] Generate types from live database
- [ ] Scholarship edit page
- [ ] Expense edit/delete functionality
- [ ] Decision/offer comparison view

---

## Phase 3 - First usable vertical slice: program to deadline to dashboard

**Date:** 2026-08-22
**Status:** ✅ Complete

### Completed

- [x] Create institutions, programs, program_evaluations, applications, application_status_history, deadlines, tasks, activity_events migrations
- [x] Add ownership-aware composite foreign keys and indexes
- [x] Add RLS policies (owner-only select/insert/update/delete) for all tables
- [x] Implement institution CRUD (create, list, archive)
- [x] Implement program CRUD (create, list, detail, archive)
- [x] Implement program evaluation with weighted score computation
- [x] Implement application CRUD with status history tracking
- [x] Implement deadline and task management
- [x] Build dashboard with real Supabase queries (next best action, deadlines, pipeline counts, blocking tasks)
- [x] Build programs list and detail pages (desktop table + mobile list)
- [x] Build applications list and detail pages
- [x] Build calendar page with upcoming deadlines and tasks
- [x] Build placeholder pages for documents, scholarships, essays, recommender, contacts, more, settings
- [x] Implement activity event logging for all mutations
- [x] Verify typecheck and production build pass

### Completed

- [x] Initialize Supabase CLI 2.115.0 and config.toml
- [x] Implement login, logout, callback, recovery, reset auth flows
- [x] Create profiles and notification-preferences migrations with RLS
- [x] Establish RLS test helpers for anonymous/owner/other-user
- [x] Configure dynamic/no-store routes and security headers/CSP
- [x] Add Zod environment validation
- [x] Verify typecheck and production build pass

### Completed

- [x] Scaffold Next.js 16.3.2 with TypeScript, Tailwind v4, shadcn/ui
- [x] Configure linting, formatting, testing, path aliases
- [x] Implement semantic tokens, fonts (Geist + Newsreader), light/dark/system themes
- [x] Build desktop sidebar, top utility bar, mobile bottom navigation
- [x] Build PageHeader, StatusBadge, DeadlineIndicator, Metric, EmptyState, DataToolbar, MobileListItem
- [x] Implement populated and empty dashboard mock states with fixture data
- [x] Create PWA manifest, offline page, theme metadata
- [x] Register minimal service worker (no private data caching)
- [x] Install all dependencies (Radix UI, Lucide, Geist font, next-themes)
- [x] Verify typecheck and production build pass

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

(none - all Phase 0 research tasks complete)

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

1. **Next.js `proxy.ts`** - replaces `middleware.ts` for Supabase session refresh (current convention as of v16)
2. **`supabase.auth.getClaims()`** - preferred over `getSession()` for server-side identity verification; validates JWT signature against JWKS
3. **`@supabase/ssr` `createBrowserClient` / `createServerClient`** - standard SSR client creation using cookie handlers
4. **PWA manifest** - `app/manifest.ts` with `MetadataRoute.Manifest` type
5. **Web Push** - `web-push` npm package with VAPID keys, service worker registered via `navigator.serviceWorker.register()`
6. **Supabase API key rename** - docs now reference `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (was `anon key`)
