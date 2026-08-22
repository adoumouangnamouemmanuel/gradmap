# GradMap security and privacy specification

Security is a release gate. The application stores private educational data, essays, contact details and uploaded files; a polished UI cannot compensate for weak authorization.

## 1. Security objectives

1. An anonymous visitor who discovers the URL learns nothing beyond the product name and login UI.
2. A valid user can access only records and objects they own.
3. A stolen password alone is insufficient to access application data or files.
4. Browser-visible keys never grant unauthorized data access.
5. File links are private, short-lived and non-indexable.
6. Reminder infrastructure cannot be abused to enumerate data or send arbitrary notifications.
7. Sensitive content is excluded from caches, logs and notification lock screens by default.
8. Destructive actions are deliberate, authenticated and recoverable where possible.

## 2. Protected assets

- Identity and account session.
- Institution/program/scholarship research.
- Application status, decisions and financial information.
- Essays and version history.
- Transcripts, CVs, certificates, identity records and uploaded documents.
- Recommender and contact details.
- Push subscription credentials.
- VAPID, cron and Supabase server secrets.
- Exports and backups.

## 3. Threat model

| Threat | Required mitigation |
| --- | --- |
| Someone finds the deployment URL | Public routes expose only login/recovery/static content |
| Credential stuffing or stolen password | Strong password, rate controls and mandatory TOTP MFA |
| Broken object-level authorization | RLS ownership policies and cross-user negative tests |
| Cross-user foreign-key injection | Ownership-aware composite relationships/checks |
| Publishable-key misuse | RLS and least-privilege grants; key is not treated as a secret |
| Secret key exposed in client | Server-only modules, env-name review and bundle scanning |
| Public or guessable file URL | Private bucket, owner path, authenticated download/short signed URL |
| Stored XSS through notes/essays/filenames | Plain text/Markdown with safe rendering; no arbitrary HTML; CSP |
| CSRF or malicious cross-origin mutation | Same-site cookies/current SSR controls, origin validation and POST-only mutation routes |
| Open redirect via callbacks/notifications | Exact redirect allowlist and internal-path allowlist |
| Sensitive browser/CDN caching | `private, no-store`, dynamic auth routes and service-worker exclusions |
| Duplicate/malicious cron invocation | Strong secret, idempotency keys, bounded worker input |
| Notification content leaks on lock screen | Privacy-safe default payload and user-controlled detail level |
| Malicious upload | Type/size/extension validation; reject active/executable formats |
| Lost phone | MFA-protected app, remote session revocation and documented recovery |
| Accidental deletion | Confirmations, archive where suitable, exports and version history |

## 4. Authentication requirements

### Account model

- Production is invite-only/single-owner.
- Provision Emmanuel's account manually through an approved administrative path.
- Disable public sign-up before production data is entered.
- Use email and password with email confirmation.
- Password-reset links use exact allowlisted redirect URLs.
- Do not reveal whether an account exists in recovery responses.

### Session validation

- Use the current Supabase SSR cookie pattern.
- Create browser/server clients separately.
- Initialize server clients per request.
- Protect routes with verified JWT claims via `getClaims()` or the current official equivalent.
- Do not authorize from `getSession()` alone on the server.
- Sign-out invokes Supabase sign-out and clears app-local non-sensitive UI state.
- Authenticated routes are dynamic and must not be ISR/CDN cached.

### MFA

- Support TOTP enrollment by QR code and manual secret entry.
- Require the user to verify a code before treating enrollment as complete.
- Implement challenge during login and factor management in settings.
- Application tables and private Storage require AAL2 using restrictive policies.
- Minimal profile/MFA bootstrap access may remain AAL1 only as required to complete enrollment.
- Removing a verified factor requires AAL2 and explicit confirmation.
- Protect the Supabase organization/admin account itself with MFA as well.
- Document recovery through the provider administration console; do not implement security questions or backup codes unless officially supported and tested.

## 5. Authorization and RLS

### Table policy baseline

Every user-owned table in the exposed schema must:

- Include a non-null `user_id` referencing `auth.users(id)`.
- Enable RLS.
- Grant only required operations to `authenticated`.
- Have explicit `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies as applicable.
- Compare ownership with `(select auth.uid()) = user_id`.
- Use both `USING` and `WITH CHECK` for update.
- Include a restrictive AAL2 policy for protected data.
- Index `user_id` and policy filter columns.

Illustrative pattern; adapt names and commands:

```sql
alter table public.applications enable row level security;

create policy applications_select_own
on public.applications for select
to authenticated
using ((select auth.uid()) = user_id);

create policy applications_insert_own
on public.applications for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy applications_update_own
on public.applications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy applications_delete_own
on public.applications for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy applications_require_aal2
on public.applications
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');
```

Confirm exact policy syntax against the current platform and test each operation. `TO authenticated` alone is not authorization.

### Cross-owner relationships

Where a child includes both `user_id` and parent ID, enforce that both point to the same owner. Preferred model:

- Parent has a unique `(id, user_id)` pair.
- Child foreign key `(parent_id, user_id)` references parent `(id, user_id)`.

This prevents a compromised or buggy client from attaching an owned child to another user's parent.

### Views and functions

- Prefer direct tables/RPC only when necessary.
- Any exposed view uses `security_invoker = true` or has API-role access revoked.
- Do not create a `SECURITY DEFINER` function to make a failing query work.
- Narrow exceptional functions live outside exposed schemas, set `search_path = ''`, validate caller/identity and revoke `EXECUTE` from public roles.
- Run database security advisor after migrations.

## 6. API and server-action security

Every mutation boundary validates:

1. HTTP method and content type where relevant.
2. Origin/host for browser-initiated requests.
3. Verified authenticated claims.
4. AAL2 where required.
5. Zod input schema and size limits.
6. Ownership/authorization independently of client-provided `user_id`.
7. Allowed state transition.
8. Safe error response.

Never accept a client-supplied owner ID as authoritative. Derive `user_id` from verified claims. Do not pass arbitrary table names, SQL fragments, Storage paths or redirect URLs from the client into privileged APIs.

## 7. Secrets and keys

### Browser-safe

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Non-sensitive app name/URL values

### Server-only

- `SUPABASE_SECRET_KEY` or current server elevated key
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`
- Email provider secrets
- Error-monitoring auth tokens

Rules:

- Never prefix server secrets with `NEXT_PUBLIC_`.
- Do not log or return secrets.
- Keep `.env.local` out of Git.
- Use separate secrets per environment.
- Rotate a secret immediately if it enters Git history, logs or client output.
- Scan production browser assets/source maps for forbidden values before release.

## 8. Storage security

### Bucket

- Bucket: `application-files`.
- Access: private.
- Maximum file size: 20 MB.
- Allowed types: PDF, DOCX, PNG and JPEG.
- Reject HTML, SVG, JavaScript, archives, macros/executables and unknown binary types in MVP.

### Object paths

```text
{user_id}/{document_id}/{document_version_id}/{sanitized_filename}
```

- Server generates IDs/path; client cannot select another owner's prefix.
- Storage policies verify bucket and first path segment against `auth.uid()`.
- Select/insert/update/delete policies are explicit.
- Prefer new version paths over upsert.
- If upsert is used, remember Storage requires select+insert+update.

### Serving

- Prefer authenticated download.
- Signed URLs expire quickly and are never stored in the database or logs.
- Responses use appropriate content type, `nosniff`, private/no-store and safe content disposition.
- Preview only supported safe formats; DOCX downloads rather than active in-browser rendering unless a trusted renderer is added.

### Upload validation

- Normalize Unicode filename and strip path characters/control characters.
- Generate a safe stored filename independent from display name.
- Validate declared MIME, extension and server-inspected signature/magic bytes when practical.
- Compute SHA-256.
- Prevent zero-byte files and oversized request bodies.
- Surface errors without exposing bucket internals.

### Deletion

- Delete through Storage API, not SQL against `storage.objects`.
- Confirm destructive intent.
- Resolve referenced-version rules first.
- Record a non-sensitive activity event.

## 9. Browser and platform protections

### Required headers

Configure and test:

- Content-Security-Policy using current Next.js nonce/hash guidance.
- `Strict-Transport-Security` in production.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin` or stricter where workable.
- `Permissions-Policy` disabling unused sensors/features.
- Frame protection through CSP `frame-ancestors 'none'`.
- Appropriate cross-origin policies where they do not break Supabase/Web Push.

CSP should narrowly allow the app origin, Supabase project endpoints and required push/font/image sources. Do not solve CSP failures with broad `unsafe-eval`/wildcards in production.

### XSS and rendering

- Render notes and essays as text by default.
- If Markdown is added, use a maintained parser and strict sanitizer; raw HTML disabled.
- Never use unsanitized `dangerouslySetInnerHTML`.
- Escape filenames, institution names and contact notes.
- Use React/Next safe rendering and CSP as defense in depth.

### Redirects and deep links

- Auth redirects match configured exact origins/paths.
- Notification routes must start with `/` and match an internal allowlist.
- Reject protocol-relative URLs, schemes, encoded traversal and external origins.

## 10. PWA security

- Service worker scope is deliberate and reviewed.
- Cache only versioned public static assets and a neutral offline page.
- Never cache application pages, API routes, auth callbacks, Supabase requests or files.
- Clear old static caches on activation.
- Update service workers predictably and notify user when refresh is required.
- Push subscription endpoint/keys are treated as sensitive operational data.
- Notification body defaults to minimal information.
- Notification action routes are allowlisted.

## 11. Reminder worker security

- Cron calls a protected worker using a long random secret stored securely.
- Worker accepts no arbitrary owner ID, SQL selector or message body from the cron request.
- Worker selects due reminders itself and processes a bounded batch.
- Atomic claim/idempotency prevents duplicate sends.
- Service secret is used only inside the worker.
- Worker logs counts/status codes, not private content.
- Web Push errors classified as transient/permanent; invalid subscriptions disabled.
- Rate/volume guard prevents accidental notification storms.

## 12. Logging, telemetry and privacy

Prohibited log data:

- Passwords, OTP/TOTP codes, JWTs, cookies and recovery tokens.
- Full push endpoints or encryption keys.
- Signed file URLs or file contents.
- Essay bodies, recommendation notes or document names when avoidable.
- Secrets and raw provider request/response bodies.

Use opaque IDs, action categories and sanitized error codes. If analytics is added, default to privacy-preserving first-party measurements and disclose it.

## 13. Backups and exports

- Database migrations reproduce schema and policies.
- Supabase platform backup behavior is documented for the selected plan.
- App offers owner JSON/CSV export.
- Bulk export requires AAL2 and explicit action.
- Export excludes secrets, auth internals, signed URLs and push cryptographic material.
- Exported files are private user responsibility; UI warns before download on shared devices.

## 14. Required security test matrix

For each private table and Storage operation, test:

| Actor | Expected result |
| --- | --- |
| Anonymous | Denied |
| Authenticated owner at AAL1 | Denied for protected data/files |
| Authenticated owner at AAL2 | Allowed for valid operation |
| Different authenticated user at AAL2 | Denied |
| Elevated worker without valid cron secret | Denied |
| Elevated worker with valid secret | Only bounded scheduled operation allowed |

Additional tests:

- Cross-user ID supplied during insert/update.
- Cross-user parent relationship attempt.
- Expired/revoked session.
- Open redirect payload.
- Oversized/disallowed/mismatched file.
- Storage path traversal or foreign user prefix.
- Duplicate cron invocation.
- Malicious Markdown/filename string.
- CSP and security-header assertions.
- Authenticated response cache-header assertions.
- Bundle scan for secret key/VAPID private key.

## 15. Production security checklist

- [ ] Owner account provisioned and public registration disabled.
- [ ] Owner app MFA enrolled and enforced.
- [ ] Supabase organization MFA enabled.
- [ ] Exact production redirect URLs configured.
- [ ] RLS enabled on every exposed table.
- [ ] Storage private and all operation policies tested.
- [ ] No secret in browser bundle, Git or logs.
- [ ] SSL enforcement and applicable network restrictions reviewed.
- [ ] Security Advisor findings resolved or explicitly documented.
- [ ] CSP and security headers pass automated checks.
- [ ] Authenticated routes and files are no-store/private.
- [ ] Cron secret stored securely and unauthorized calls fail.
- [ ] Export/recovery procedure tested.
- [ ] Account/MFA recovery procedure documented and stored safely.

## 16. Residual-risk policy

Any unresolved P0/P1 vulnerability blocks production deployment. Do not label a security finding “acceptable” solely because the application initially has one user. The public internet, browser extensions, stolen sessions and misconfiguration remain relevant threats.
