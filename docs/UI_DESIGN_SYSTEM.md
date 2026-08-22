# GradMap UI and design system

Visual quality is a P0 product requirement. This document defines a distinctive interface direction so implementation does not collapse into a generic shadcn dashboard.

## 1. Design concept: academic editorial command center

GradMap should feel like a beautifully designed personal research journal combined with a precise mission-control workspace.

Desired qualities:

- Intelligent, calm and aspirational.
- Serious enough for consequential decisions, warm enough for daily use.
- Editorial typography paired with highly legible operational UI.
- Data-dense without feeling cramped.
- Refined on desktop and genuinely native-feeling as an installed mobile PWA.

Avoid:

- Generic enterprise admin templates.
- Endless identical white cards.
- Oversized decorative hero sections that push work below the fold.
- Excessive borders, pills, gradients, shadows or saturated colors.
- Tiny gray text, low contrast and color-only status.
- Empty charts or decorative metrics with no action.

## 2. Brand foundation

Working name: **GradMap**.

Working line: **Your path to the next chapter, clearly organized.**

The name and line must be centralized in configuration so Emmanuel can rename the product without component edits.

### Logo direction

Use a simple custom mark combining a bookmark/page corner with a subtle north-star or path motif. It must work at 16px favicon size and as a maskable PWA icon. Do not use a graduation-cap cliché.

If a final custom mark is not available, use a restrained monogram placeholder and clearly mark icon production as required before release.

## 3. Typography

### Families

- Display/editorial: `Newsreader` or an equivalent refined serif via `next/font`.
- UI/body: `Geist Sans` or an equivalent modern sans via `next/font`.
- Monospace: `Geist Mono` only for IDs, technical values and keyboard hints.

Fonts must be optimized/self-hosted through Next.js. Do not load runtime font CSS from an uncontrolled third-party domain.

### Scale

| Token | Desktop | Mobile | Use |
| --- | --- | --- | --- |
| `display` | 42/46 | 34/38 | Dashboard greeting and major empty-state phrase |
| `h1` | 32/38 | 28/34 | Page title |
| `h2` | 24/30 | 22/28 | Major section |
| `h3` | 18/24 | 18/24 | Card/section title |
| `body` | 15/23 | 15/23 | Default text |
| `small` | 13/19 | 13/19 | Supporting metadata |
| `micro` | 11/16 | 11/16 | Labels used sparingly, never core content |

Use editorial serif for selective high-level titles and numbers, not forms or dense tables. Operational text remains sans-serif.

## 4. Color system

Use semantic tokens implemented with CSS variables/OKLCH and consumed through Tailwind/shadcn tokens. Exact values may be tuned through visual testing while preserving the roles below.

### Light theme direction

- Background: warm paper, not stark blue-white.
- Foreground: deep ink/navy.
- Primary: confident indigo.
- Secondary accent: scholarly teal/emerald.
- Muted surface: cool-warm neutral with clear separation.
- Warning: amber/ochre.
- Destructive: controlled red.
- Success: emerald with a text/icon companion.

Suggested starting tokens:

```css
--background: oklch(0.985 0.008 85);
--foreground: oklch(0.205 0.025 255);
--card: oklch(1 0 0);
--primary: oklch(0.49 0.19 267);
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.95 0.025 180);
--secondary-foreground: oklch(0.31 0.075 180);
--muted: oklch(0.955 0.01 80);
--muted-foreground: oklch(0.47 0.025 255);
--accent: oklch(0.92 0.045 265);
--border: oklch(0.90 0.012 255);
--ring: oklch(0.58 0.18 267);
```

### Dark theme direction

- Background: deep ink, not pure black.
- Surfaces: gently lifted navy-charcoal.
- Primary: luminous but controlled indigo/lilac.
- Borders: visible at low contrast without creating boxes everywhere.
- Preserve WCAG contrast for text and state indicators.

### Status system

Every status uses a coordinated icon/label plus color:

- Neutral/exploring: slate + compass/circle icon.
- Preparing/action: indigo + progress icon.
- Attention/due: amber + clock/triangle icon.
- Submitted/complete: teal/emerald + check icon.
- Positive decision: emerald + seal/check icon.
- Negative/blocked: red + clear text/icon.

Do not use red/green alone; labels remain visible.

## 5. Shape, spacing and elevation

- Base spacing uses a 4px unit with an 8px dominant rhythm.
- Page gutters: 20px mobile, 28–32px tablet, 36–48px desktop depending on shell.
- Content max width varies by workflow: approximately 1280–1440px for dashboard/tables, 760–920px for focused forms/reading.
- Base radius: 12–16px for containers, 8–10px for controls; pills only for true tags/statuses.
- Use subtle 1px borders and tonal surfaces before shadows.
- Shadows are reserved for overlays, floating command controls and meaningful elevation.
- Do not wrap every section in a bordered card. Use composition, dividers and whitespace.

## 6. Application shell

### Desktop

- Left sidebar with compact logo, grouped navigation, cycle progress and bottom account/settings.
- Sidebar supports refined collapse to icon rail.
- Top utility bar contains breadcrumb/context, global search command trigger, quick add and notifications.
- Main canvas has stable max width and avoids excessive empty margins.

### Tablet

- Collapsible sheet/sidebar.
- Preserve data-table utility where space permits.
- Context actions remain visible without crowding title.

### Mobile installed PWA

- Bottom navigation: Home, Applications, Calendar, Documents, More.
- Floating/centered quick-add affordance may be used if it does not obstruct content.
- Top bar includes compact page title, search and notifications.
- Respect `env(safe-area-inset-*)`.
- Primary actions are thumb-reachable; touch targets at least 44×44.
- Use drawers/sheets for filters and short edits, full pages for multi-step forms.

## 7. Dashboard composition

The dashboard should feel composed, not tiled.

### Above the fold

1. Editorial greeting and cycle context.
2. One “Next best action” panel with exact deadline/blocker rationale.
3. Compact cycle progress/focus indicators.

### Main workspace

- **Focus queue:** today/this week items as a vertical action list.
- **Deadline horizon:** elegant 30-day timeline, not a decorative chart.
- **Application pipeline:** accessible segmented/funnel summary with counts and links.
- **Funding outlook:** funding target/awarded/gap using exact currencies; no guessed conversion.
- **Readiness:** application/document/recommendation blockers.
- **Recent activity:** quiet chronological list.

Use asymmetrical layout carefully-one dominant column and a contextual rail work better than six equal cards.

## 8. Screen patterns

### List/index screens

- Title, short context and one primary add action.
- Search/filter row with active-filter summary.
- Desktop: powerful data table with column visibility and meaningful density.
- Mobile: structured list cards with priority, next deadline, status and one overflow menu.
- View toggle only when both views provide real value.
- Saved views may be added later.

### Detail screens

- Compact identity header: name, institution/context, status, priority and primary action.
- Secondary navigation via tabs: Overview, Requirements, Essays, Recommenders, Activity as appropriate.
- Sticky contextual action rail on desktop where helpful.
- Mobile keeps the main action visible but does not obscure content.

### Forms

- Use focused page layout for important forms.
- Group fields by user intention with clear section titles and descriptions.
- Labels are persistent; placeholders show examples only.
- Validate at field level and provide an error summary for long forms.
- Preserve unsaved data warning for long essays/forms.
- Use comboboxes for institution/program relationships and date-time pickers that expose timezone.
- Keep advanced/rare fields behind a clear disclosure, not hidden without explanation.

### Boards

- Application board columns use status with counts.
- Cards show program, institution, country, nearest deadline and blocker count.
- Keyboard-accessible status movement and an alternative status menu are required.
- Mobile uses a horizontally navigable section or grouped list without tiny columns.

### Calendar

- Month view on desktop; agenda is default on narrow mobile.
- Deadlines/tasks distinguish type with icon and text.
- Selecting an item opens a concise popover/sheet with full route option.
- Filters remain understandable and resettable.

### Document library

- Library view combines readiness/status with file metadata.
- Show strong safe-file iconography and current-version indicator.
- Version timeline is visually clear and immutable.
- Upload has drag/drop on desktop and camera/files choice where mobile browser allows.
- Progress, scanning/validation state, failure and retry are fully designed.

### Notifications

- Group by Today/Earlier.
- Unread is indicated by weight/marker plus text semantics.
- Privacy settings explain what may appear on a lock screen.
- Device list shows browser/device label, last seen and enable state without exposing endpoint.

## 9. shadcn/ui component usage

Use current components as accessible primitives, then theme them consistently:

- Sidebar, Sheet and Drawer for adaptive shell/navigation.
- Command for global search and quick actions.
- Data Table/Table for desktop data density.
- Card only for meaningful grouped surfaces.
- Tabs for detail subsections.
- Dialog/Alert Dialog for short confirmation; not long forms.
- Dropdown Menu/Context Menu for secondary actions.
- Calendar/Date Picker for deadlines.
- Progress for explained readiness only.
- Chart wrappers for useful comparisons.
- Skeleton, Empty, Spinner and Sonner for states/feedback.
- Tooltip for icon-only controls; never hide required information only in a tooltip.

Do not leave default shadcn spacing/colors unchanged across unrelated components. Build project primitives such as `PageHeader`, `StatusBadge`, `DeadlineIndicator`, `Metric`, `EmptyState`, `DataToolbar`, `MobileListItem` and `ConfirmDangerDialog`.

## 10. Iconography and illustration

- Use Lucide icons with consistent 1.75–2px stroke and optical sizing.
- Do not mix icon families.
- Avoid emoji as product icons.
- Empty states may use small abstract line illustrations based on paths/pages/stars, but they must not dominate the workspace.
- Institution logos may be added only from safe sources or user upload; the interface must work perfectly without them.

## 11. Motion

- 120–200ms for controls and small state transitions.
- 200–320ms for sheets/drawers and content entry.
- Use opacity/transform, not layout-thrashing animation.
- Motion communicates relationship: item added, filter applied, panel opened, progress changed.
- No continuous decorative movement.
- Honor `prefers-reduced-motion` with motion removed or reduced.

## 12. Content design

Tone: concise, calm, precise and encouraging.

Preferred:

- `Add your first program`
- `Due in 3 days · 2 requirements incomplete`
- `Your file is private and visible only to you`
- `Enable reminders on this device`

Avoid:

- Vague `Something went wrong` without recovery.
- Alarmist copy for ordinary deadlines.
- Casual jokes around rejection, funding or security.
- Technical Supabase/provider terminology in user-facing errors.

## 13. Accessibility

- WCAG 2.2 AA contrast and interaction semantics.
- Visible focus ring consistent with theme.
- Correct headings, landmarks and labels.
- Keyboard command palette and board alternatives.
- Screen-reader text for icon-only actions.
- Live-region announcements for async upload/save results.
- Form error summary links to invalid fields.
- Charts include a text/table summary.
- Reduced motion and 200% zoom support.
- Mobile landscape and large text should remain usable.

## 14. State completeness checklist

Every component/page must cover:

- Empty first-use.
- Empty after filtering.
- Loading.
- Loaded.
- Partial data.
- Validation error.
- Network/server error.
- Permission/session expiration.
- Success confirmation.
- Disabled/processing destructive action.

## 15. Visual QA gate

Before release, inspect at minimum:

- 390×844 mobile light/dark.
- 768×1024 tablet light/dark.
- 1024×768 compact desktop.
- 1440×900 desktop light/dark.

Core screens:

- Login/MFA.
- Empty and populated dashboard.
- Program/application lists and details.
- Board and calendar.
- Document library/upload/version view.
- Essay editor.
- Recommender view.
- Notification/settings/PWA install states.

Reject release for horizontal overflow, clipped controls, inconsistent density, weak hierarchy, poor empty states, unreadable contrast, default-template appearance or mobile interactions that require desktop precision.

## 16. Design acceptance statement

The interface is acceptable only when a reviewer can tell that GradMap was designed specifically for a serious graduate-application journey-not merely recolored from a component-library dashboard.
