# GradMap product requirements

## 1. Product summary

GradMap is Emmanuel Adoum's private command center for planning, preparing and submitting graduate-school and scholarship applications for the 2027 intake.

It consolidates program research, scholarship matching, deadlines, tasks, files, essays, recommenders, contacts, costs, reminders and decisions into one secure installable web application.

The product must be useful immediately for applications beginning in September 2026. It is not intended to become a public SaaS during the application cycle.

## 2. Product outcomes

GradMap succeeds when it helps Emmanuel:

1. Know exactly what deserves attention today and this week.
2. Avoid missing program, scholarship, document or recommender deadlines.
3. Compare programs and funding opportunities consistently.
4. Keep every required document and essay version organized.
5. Track who has been contacted and what needs follow-up.
6. Understand application spending and funding coverage.
7. Access the tracker securely from laptop and installed phone PWA.
8. Recover/export the complete record without vendor lock-in.

## 3. User and context

### Primary user

Emmanuel Adoum, BSc Computer Engineering student at Ashesi University, graduating in May 2027 and targeting graduate study beginning in 2027.

Known interests include computer science, AI/machine learning and technology for sustainability/climate impact. France and the Eiffel Scholarship are high-priority targets; other countries/opportunities can be added without hardcoded restrictions.

### Default preferences

- Timezone: `Africa/Accra`.
- Target intake year: 2027.
- Expected graduation month: May 2027; exact date remains unset until verified.
- Date presentation: clear local date/time with timezone where ambiguity matters.
- Application language: English UI; program/document content may include French.

## 4. Locked constraints

- Online-first; no offline application-data layer or sync engine.
- Installable PWA for phone and desktop.
- Production access is personal/invite-only.
- Email/password login plus mandatory TOTP MFA.
- Supabase backend and private Storage.
- In-app and Web Push notifications.
- Security and exceptional UI quality are both P0.
- No application-portal passwords, card details or unrelated sensitive credentials.

## 5. Information architecture

### Primary navigation

1. Dashboard
2. Programs
3. Scholarships
4. Applications
5. Calendar
6. Documents
7. More: Essays, Recommenders, Contacts, Costs, Notifications and Settings

Desktop may expose more destinations in the sidebar. Mobile uses five high-frequency bottom destinations and a More sheet.

### Global actions

- Quick add via command menu: program, scholarship, application, deadline, task, document, contact.
- Global search across authorized records.
- Notification center.
- Theme and account controls.

## 6. Functional requirements

Requirement keywords: **Must** is MVP/release-blocking; **Should** is expected before full handoff; **Could** is optional.

### 6.1 Authentication and account security

| ID | Requirement |
| --- | --- |
| AUTH-01 | The system must support email/password login and safe password recovery. |
| AUTH-02 | Production public registration must be disabled after the owner account is provisioned. |
| AUTH-03 | The system must provide complete TOTP enrollment, verification, challenge and factor-management flows. |
| AUTH-04 | Protected application data and files must require an AAL2 session. |
| AUTH-05 | Anonymous or AAL1 visits to protected routes must be redirected without leaking private data. |
| AUTH-06 | The user must be able to view basic session/device security information and sign out. |
| AUTH-07 | Auth callback and recovery redirects must use an exact internal allowlist. |

### 6.2 Dashboard

The dashboard is the command center, not a decorative report.

| ID | Requirement |
| --- | --- |
| DASH-01 | Show a personalized greeting, current application-cycle phase and one dominant next action. |
| DASH-02 | Show items due today, in seven days and in thirty days, ordered by urgency and priority. |
| DASH-03 | Show application pipeline counts and progress. |
| DASH-04 | Show scholarship/funding outlook: targeted, submitted, awarded and gaps. |
| DASH-05 | Show document readiness across active applications. |
| DASH-06 | Show recommender requests needing action. |
| DASH-07 | Show recent activity and unread notification count. |
| DASH-08 | Empty dashboard sections must guide the first useful action. |
| DASH-09 | Calculations must be traceable to underlying records and update after mutations. |

### 6.3 Institutions and programs

| ID | Requirement |
| --- | --- |
| PROG-01 | Create, view, edit, archive and restore institutions. |
| PROG-02 | Create graduate programs linked to institutions. |
| PROG-03 | Track degree type, department, field, country/city, intake, duration, delivery mode, URLs and notes. |
| PROG-04 | Track research/career fit, academic fit, funding strength, admission feasibility and location/personal fit on a consistent scale. |
| PROG-05 | Calculate an optional normalized priority score using configurable weights; always show component scores. |
| PROG-06 | Mark programs as exploring, shortlisted, applying, applied, closed or archived. |
| PROG-07 | Filter/sort by country, degree, field, status, priority, score, deadline and funding strength. |
| PROG-08 | Compare selected programs across exact dimensions in a responsive comparison view. |
| PROG-09 | Store the source URL and last-verified timestamp for critical deadline/requirement research. |

### 6.4 Scholarships and funding

| ID | Requirement |
| --- | --- |
| SCH-01 | Create, edit, archive and restore scholarships/funding opportunities. |
| SCH-02 | Track provider, countries, eligibility, funding type, amount/currency, coverage, service obligations and official URL. |
| SCH-03 | Link a scholarship to one or more compatible programs. |
| SCH-04 | Track whether funding is automatic, nomination-based or requires a separate application. |
| SCH-05 | Track eligibility as unknown, likely, eligible, ineligible or needs verification with notes. |
| SCH-06 | Support multiple deadlines and verified-source metadata. |
| SCH-07 | Highlight the Eiffel Scholarship as a configurable priority record, not hardcoded product behavior. |
| SCH-08 | Compare funding coverage and remaining estimated personal cost. |

### 6.5 Program applications

| ID | Requirement |
| --- | --- |
| APP-01 | Create one program application per program/intake/round combination. |
| APP-02 | Track status: researching, shortlisted, preparing, ready, submitted, interview, waitlisted, admitted, rejected, withdrawn, deferred or enrolled. |
| APP-03 | Track priority, application round, portal URL, non-secret applicant/reference ID, fee, waiver and submission date. |
| APP-04 | Show table, board and detail views backed by the same data. |
| APP-05 | Record status history and key dates. |
| APP-06 | Link deadlines, tasks, requirements, essays, recommenders, contacts, scholarships and expenses. |
| APP-07 | Require confirmation for terminal/destructive state transitions and allow correction with activity history. |
| APP-08 | Show a readiness checklist derived from outstanding requirements, essays, recommendations and tasks. |

### 6.6 Scholarship applications

| ID | Requirement |
| --- | --- |
| FUND-01 | Track separate scholarship applications when required. |
| FUND-02 | Support statuses: researching, eligible, preparing, nomination_pending, submitted, interview, awarded, reserve, rejected, withdrawn or not_required. |
| FUND-03 | Link to the relevant program application when applicable. |
| FUND-04 | Track nomination needs, award amount/currency, decision date and conditions. |
| FUND-05 | Reuse document, essay, recommender, deadline and task workflows. |

### 6.7 Deadlines, tasks and calendar

| ID | Requirement |
| --- | --- |
| PLAN-01 | Support multiple deadline types: priority, final, funding, document, recommendation, interview, decision, internal and custom. |
| PLAN-02 | Every external deadline must support source URL and last-verified time. |
| PLAN-03 | Store due instants in UTC and render in configured timezone. Date-only deadlines must have an explicit local cutoff convention. |
| PLAN-04 | Tasks support status, priority, due date, estimate, notes and optional related entity. |
| PLAN-05 | Calendar provides month and agenda views with filters. |
| PLAN-06 | Urgency labels must consider due time, completion and priority without relying on color alone. |
| PLAN-07 | Completing a task/deadline updates related readiness and cancels future unsent reminders. |
| PLAN-08 | Quick rescheduling and bulk completion may be provided but must show exact effects. |

### 6.8 Reminders and notifications

| ID | Requirement |
| --- | --- |
| NOTIF-01 | Create reminders for deadlines, tasks and recommendation requests. |
| NOTIF-02 | Offer configurable presets such as 30, 14, 7, 3 and 1 day before, plus custom time. |
| NOTIF-03 | Support in-app and Web Push channels. |
| NOTIF-04 | Reminder dispatch must work while the PWA is closed. |
| NOTIF-05 | Delivery must be idempotent and resistant to duplicate scheduler runs. |
| NOTIF-06 | Notification center supports unread/read, mark all read and deep links. |
| NOTIF-07 | User can enable/disable individual device subscriptions and run a test notification. |
| NOTIF-08 | Push permission must follow explicit user action and denial must not break the app. |
| NOTIF-09 | Default lock-screen copy must not reveal sensitive program/document detail. |
| NOTIF-10 | The system should optionally provide a daily digest time, disabled by default until verified. |

### 6.9 Documents and private file storage

| ID | Requirement |
| --- | --- |
| DOC-01 | Maintain a document library with categories such as CV, transcript, degree/status letter, ID, language test, recommendation, certificate, writing sample, research proposal, financial and other. |
| DOC-02 | Track document state: missing, draft, needs_update, ready, expired or archived. |
| DOC-03 | Upload PDF, DOCX, PNG or JPEG files up to 20 MB to private Storage. |
| DOC-04 | Maintain immutable document versions and identify one current version. |
| DOC-05 | Store display name, version label, MIME type, size, checksum, created time, expiry and notes. |
| DOC-06 | Preview safe supported formats and securely download others. |
| DOC-07 | Link an exact document version to an application requirement. |
| DOC-08 | Requirement state supports not_started, collecting, ready, uploaded, submitted, accepted, rejected or waived. |
| DOC-09 | Warn before deleting a version referenced by a submitted requirement. |
| DOC-10 | Show document readiness and expiring/needs-update warnings. |
| DOC-11 | Never create a permanent public file URL. |

### 6.10 Essays

| ID | Requirement |
| --- | --- |
| ESSAY-01 | Store essay/personal-statement prompts linked to a program or scholarship application. |
| ESSAY-02 | Track prompt text, word/character limit, status, due date and notes. |
| ESSAY-03 | Maintain version history with title, body text, word count and change note. |
| ESSAY-04 | Allow a version to be marked current/final without deleting prior work. |
| ESSAY-05 | Support plain text or safe Markdown; arbitrary HTML is prohibited. |
| ESSAY-06 | Autosave should be considered only if it cannot cause silent overwrites; explicit saved status is required. |
| ESSAY-07 | Export/copy the final text cleanly. |

### 6.11 Recommenders and recommendation requests

| ID | Requirement |
| --- | --- |
| REC-01 | Store recommender contact/profile information and relationship notes. |
| REC-02 | Create a recommendation request for a program or scholarship application. |
| REC-03 | Track planned, requested, accepted, submitted, declined and overdue states. |
| REC-04 | Track request date, due date, submission date, portal-invite status and waiver choice. |
| REC-05 | Show each recommender's workload and upcoming deadlines. |
| REC-06 | Create follow-up tasks/reminders without automatically sending email in MVP. |

### 6.12 Contacts and interactions

| ID | Requirement |
| --- | --- |
| CONTACT-01 | Track professors, admissions staff, alumni, current students and scholarship contacts. |
| CONTACT-02 | Link contacts to institution/program where relevant. |
| CONTACT-03 | Record email, role, research interests, official profile URL and notes. |
| CONTACT-04 | Record interaction date, channel, direction, subject, summary and follow-up date. |
| CONTACT-05 | The system must not pretend it sent external messages; it records activity only. |

### 6.13 Costs and decisions

| ID | Requirement |
| --- | --- |
| COST-01 | Record fees and other application-related expenses with exact currency and date. |
| COST-02 | Distinguish planned, due, paid, waived and refunded amounts. |
| COST-03 | Dashboard shows totals by currency without silently applying guessed exchange rates. |
| COST-04 | Track admission and scholarship decisions, conditions, response deadlines and deposit requirements. |
| COST-05 | Compare offers across funding, estimated remaining cost, program fit and response date. |

### 6.14 Search, import and export

| ID | Requirement |
| --- | --- |
| DATA-01 | Global search across institutions, programs, scholarships, applications, documents, contacts and tasks. |
| DATA-02 | Search results expose only authorized owner data. |
| DATA-03 | Export complete structured owner data to JSON. |
| DATA-04 | Export useful lists to CSV. |
| DATA-05 | Export requires AAL2 and explicit confirmation. |
| DATA-06 | Export excludes secrets, auth internals, push cryptographic keys and signed URLs. |
| DATA-07 | CSV import may be added later with preview, validation and duplicate handling; it is not a release blocker. |

### 6.15 PWA and mobile use

| ID | Requirement |
| --- | --- |
| PWA-01 | The web app must be installable on supported Android, iOS, desktop Chrome/Edge and other compatible browsers. |
| PWA-02 | Installed launch uses standalone display and a polished splash/icon experience. |
| PWA-03 | Provide contextual installation guidance, including iOS Add to Home Screen. |
| PWA-04 | Mobile navigation and forms must be designed for touch and safe areas. |
| PWA-05 | The service worker must never cache private application data. |
| PWA-06 | When offline, show a neutral internet-required page; do not display stale private records. |
| PWA-07 | Updating the service worker must not trap users on an obsolete version. |

### 6.16 Settings

- Profile and application-cycle defaults.
- Timezone and date preferences.
- Theme: light, dark and system.
- Program score weights.
- Notification privacy, default offsets, quiet hours and device subscriptions.
- MFA factor management.
- Data export.
- Archive and destructive account/data actions with clear warnings.

## 7. Scoring and derived metrics

### Program priority score

Five optional components use a 0–5 scale:

- Academic fit.
- Research/career fit.
- Funding strength.
- Admission feasibility.
- Location/personal fit.

User-configurable weights total 100. When every scored component is present:

```text
normalized score = sum(component / 5 × weight)
```

If components are missing, display `Not fully scored` and the known components; do not present false precision. Always let the user override display priority separately.

### Readiness

Application readiness is derived from required items:

- Required document requirements satisfied.
- Required essays final.
- Recommendation requests submitted/waived where required.
- Blocking tasks completed.
- Submission deadline still open.

Display the numerator/denominator and blocking items. A progress percentage without explanation is insufficient.

### Deadline risk

Risk combines time remaining, completion state and priority. The UI must show the human-readable reason, such as `Due in 2 days · 3 blockers`, rather than an unexplained color score.

## 8. Non-functional requirements

### Security and privacy

All controls in `SECURITY.md` are mandatory. No anonymous data access, cross-user access, AAL1 protected access or public file access is acceptable.

### Visual quality

All controls in `UI_DESIGN_SYSTEM.md` are mandatory. The application must feel coherent and premium across required viewports, with complete states and accessible interaction.

### Accessibility

- Target WCAG 2.2 AA.
- Keyboard access for all controls.
- Visible focus and logical focus order.
- Semantic labels and meaningful landmarks.
- Status never communicated by color alone.
- Minimum 44×44 CSS pixel touch targets for primary mobile actions.
- Reduced-motion support.
- Accessible chart summaries and form errors.
- Lighthouse accessibility target ≥95 on core routes, with remaining issues documented/fixed.

### Performance

- Core dashboard should be usable quickly on an ordinary Ghanaian mobile connection.
- Avoid large client bundles and unnecessary chart libraries.
- Paginate/filter server-side when lists grow.
- Optimize images/icons and self-host fonts through Next.js.
- Use skeletons without large layout shift.
- Do not prefetch sensitive content unnecessarily.

### Reliability

- Mutations give deterministic success/error feedback.
- Reminder dispatch is idempotent and retry-aware.
- Timezone/DST handling is tested even though the default timezone has no DST.
- Upload partial failures are cleaned up.
- Application state is reproducible from migrations and exports.

### Maintainability

- Strict TypeScript and generated database types.
- Pinned dependencies and committed lockfile.
- Clear feature boundaries and minimal duplicated business logic.
- Schema changes only through reviewed migrations.
- Tests accompany domain/security behavior.

## 9. Empty/loading/error states

Every major screen must define:

- First-use empty state with one clear next action.
- Filtered empty state that offers filter reset.
- Loading skeleton preserving final layout.
- Recoverable error state with retry.
- Permission/session error that does not expose private data.
- Success confirmation for non-obvious mutations.

## 10. Out of scope for MVP

- Offline application data and synchronization.
- Multi-user teams, counselors or shared workspaces.
- Public signup and billing.
- Automatic email sending to recommenders/contacts.
- Automatic submission to school portals.
- Storing portal credentials.
- AI essay writing/scoring, scraping or program recommendations.
- Native iOS/Android applications.
- Complex exchange-rate conversion.
- Collaborative real-time editing.
- Malware scanning service; active file formats remain disallowed.

## 11. Release acceptance scenarios

1. **URL discovery:** anonymous visitor opens production URL and can access only public login/recovery/static routes.
2. **MFA:** owner signs in with password, completes TOTP challenge and reaches dashboard; AAL1 direct database/file request fails.
3. **First program:** owner creates institution, program, evaluation, application and verified deadline; dashboard updates correctly.
4. **Funding:** owner creates Eiffel Scholarship record, links it to a program and tracks a separate scholarship application.
5. **Documents:** owner uploads a CV, creates a second version, marks it current, links the exact version to a requirement and securely downloads it.
6. **Planning:** owner creates a task and reminders, sees them in calendar and receives one in-app/push notification without duplicates.
7. **Recommendations:** owner tracks two recommender requests with different application deadlines and sees follow-up needs.
8. **Mobile:** owner installs PWA on phone, navigates comfortably at 390px width, enables push and follows a notification deep link.
9. **Cross-user isolation:** test user B cannot read, mutate, reference or download test user A's data/files.
10. **Export:** owner at AAL2 exports JSON/CSV that contains application data but no auth/push secrets or signed URLs.
11. **Visual QA:** dashboard, lists, details, forms, calendar, documents and settings pass responsive/accessibility review in light and dark themes.
12. **Recovery:** fresh local database reset applies migrations, generates types and passes RLS tests.

## 12. Product completion boundary

The MVP is complete when all Must requirements and release acceptance scenarios pass. Additional features must not delay Emmanuel from entering real September 2026 applications.
