# GradMap implementation pack

GradMap is Emmanuel Adoum's secure, installable graduate-school and scholarship application command center for the 2027 intake. This pack is the source of truth for an AI coding agent.

## Start here

1. Copy `AGENTS.md` to the root of the application repository.
2. Copy the `docs/` directory to the repository root.
3. Copy `.env.example` to the repository root; create `.env.local` from it without committing secrets.
4. Give the coding agent the contents of `MASTER_PROMPT.md`.
5. Tell the agent to execute the roadmap sequentially and verify every phase before continuing.

If the repository is empty, the agent should scaffold the project. If code already exists, it must inspect and adapt it without deleting unrelated work.

## Source-of-truth order

When documents appear to conflict, use this order:

1. `AGENTS.md`
2. `docs/SECURITY.md`
3. `docs/PRODUCT_REQUIREMENTS.md`
4. `docs/DATA_MODEL.md`
5. `docs/ARCHITECTURE.md`
6. `docs/UI_DESIGN_SYSTEM.md`
7. `docs/ROADMAP.md`

`MASTER_PROMPT.md` tells the agent how to use these specifications; it does not override them.

## Locked product decisions

- Online-first web application; offline synchronization is explicitly out of scope.
- Installable Progressive Web App for phone and desktop.
- Next.js App Router, strict TypeScript, Tailwind CSS and shadcn/ui.
- Supabase for Auth, Postgres, private Storage, scheduled jobs and Edge Functions.
- Invite-only/personal production access; public registration disabled.
- Email/password plus mandatory TOTP MFA for access to application data and files.
- Database-enforced ownership through RLS on every exposed table.
- Private file bucket only; never expose permanent public file URLs.
- In-app notifications and opt-in Web Push reminders.
- Security and visual quality are both release-blocking priorities.

## Files

| File | Purpose |
| --- | --- |
| `MASTER_PROMPT.md` | Complete initial instruction for the coding agent |
| `AGENTS.md` | Permanent repository rules for every agent session |
| `docs/PRODUCT_REQUIREMENTS.md` | Scope, workflows and acceptance criteria |
| `docs/DATA_MODEL.md` | Relational model, constraints, indexes and RLS expectations |
| `docs/ARCHITECTURE.md` | Technical boundaries and runtime flows |
| `docs/UI_DESIGN_SYSTEM.md` | Visual direction, components and responsive behavior |
| `docs/SECURITY.md` | Threat model, mandatory controls and security tests |
| `docs/ROADMAP.md` | Ordered vertical implementation phases |
| `.env.example` | Environment-variable contract without secrets |

## Definition of success

The product is ready when Emmanuel can securely install it on his phone, sign in with MFA, track real programs and scholarships, store private document versions, see upcoming work, and receive reliable reminders without any other authenticated user or anonymous visitor being able to access his records or files.
