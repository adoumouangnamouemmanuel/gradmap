// Shared constants — single source of truth for all dropdown values.

// ─── CURRENCIES ──────────────────────────────────────────────

export const CURRENCIES = [
  { code: "GHS", label: "GHS - Ghanaian Cedi" },
  { code: "NGN", label: "NGN - Nigerian Naira" },
  { code: "KES", label: "KES - Kenyan Shilling" },
  { code: "ZAR", label: "ZAR - South African Rand" },
  { code: "XAF", label: "XAF - CFA Franc (Central)" },
  { code: "XOF", label: "XOF - CFA Franc (West)" },
  { code: "ETB", label: "ETB - Ethiopian Birr" },
  { code: "EGP", label: "EGP - Egyptian Pound" },
  { code: "MAD", label: "MAD - Moroccan Dirham" },
  { code: "TZS", label: "TZS - Tanzanian Shilling" },
  { code: "UGX", label: "UGX - Ugandan Shilling" },
  { code: "GMD", label: "GMD - Gambian Dalasi" },
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "CHF", label: "CHF - Swiss Franc" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "CNY", label: "CNY - Chinese Yuan" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "SEK", label: "SEK - Swedish Krona" },
  { code: "NOK", label: "NOK - Norwegian Krone" },
  { code: "DKK", label: "DKK - Danish Krone" },
  { code: "PLN", label: "PLN - Polish Zloty" },
  { code: "CZK", label: "CZK - Czech Koruna" },
  { code: "HUF", label: "HUF - Hungarian Forint" },
  { code: "NZD", label: "NZD - New Zealand Dollar" },
  { code: "SGD", label: "SGD - Singapore Dollar" },
  { code: "KRW", label: "KRW - South Korean Won" },
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "BRL", label: "BRL - Brazilian Real" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

// ─── COUNTRIES ───────────────────────────────────────────────

export const COUNTRIES = [
  // Africa
  "Algeria",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo (DRC)",
  "Congo (Republic)",
  "Côte d'Ivoire",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "São Tomé and Príncipe",
  "Senegal",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
  // Europe
  "Austria",
  "Belgium",
  "Czech Republic",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Hungary",
  "Ireland",
  "Italy",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  // Asia
  "China",
  "India",
  "Japan",
  "South Korea",
  "Singapore",
  // Americas
  "Brazil",
  "Canada",
  "Mexico",
  "United States",
  // Oceania
  "Australia",
  "New Zealand",
  // Multi
  "Erasmus Mundus (Multi-country)",
  "Other",
] as const;

// ─── PROGRAM STATUSES ────────────────────────────────────────

export const PROGRAM_STATUSES = [
  "exploring",
  "shortlisted",
  "applying",
  "applied",
  "withdrawn",
  "closed",
] as const;

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
  exploring: "Exploring",
  shortlisted: "Shortlisted",
  applying: "Applying",
  applied: "Applied",
  withdrawn: "Withdrawn",
  closed: "Closed",
};

// ─── APPLICATION STATUSES ────────────────────────────────────

export const APPLICATION_STATUSES = [
  "researching",
  "preparing",
  "submitted",
  "under_review",
  "interview",
  "waitlisted",
  "admitted",
  "rejected",
  "withdrawn",
  "deferred",
  "enrolled",
] as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  researching: "Researching",
  preparing: "Preparing",
  submitted: "Submitted",
  under_review: "Under Review",
  interview: "Interview",
  waitlisted: "Waitlisted",
  admitted: "Admitted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
  enrolled: "Enrolled",
};

// ─── SCHOLARSHIP STATUSES ───────────────────────────────────

export const SCHOLARSHIP_STATUSES = [
  "researching",
  "eligible",
  "preparing",
  "nominated",
  "submitted",
  "interview",
  "awarded",
  "reserve",
  "rejected",
  "withdrawn",
] as const;

export const SCHOLARSHIP_STATUS_LABELS: Record<string, string> = {
  researching: "Researching",
  eligible: "Eligible",
  preparing: "Preparing",
  nominated: "Nominated",
  submitted: "Submitted",
  interview: "Interview",
  awarded: "Awarded",
  reserve: "Reserve List",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

// ─── ELIGIBILITY STATUSES ────────────────────────────────────

export const ELIGIBILITY_STATUSES = [
  "unknown",
  "likely",
  "eligible",
  "ineligible",
  "needs_verification",
] as const;

export const ELIGIBILITY_STATUS_LABELS: Record<string, string> = {
  unknown: "Unknown",
  likely: "Likely Eligible",
  eligible: "Eligible",
  ineligible: "Ineligible",
  needs_verification: "Needs Verification",
};

// ─── FUNDING TYPES ───────────────────────────────────────────

export const FUNDING_TYPES = [
  "full",
  "partial",
  "stipend",
  "tuition_waiver",
  "loan",
  "fellowship",
  "government_sponsorship",
  "work_study",
  "other",
] as const;

export const FUNDING_TYPE_LABELS: Record<string, string> = {
  full: "Full Scholarship",
  partial: "Partial Tuition",
  stipend: "Stipend Only",
  tuition_waiver: "Tuition Waiver",
  loan: "Loan",
  fellowship: "Fellowship",
  government_sponsorship: "Government Sponsorship",
  work_study: "Work-Study",
  other: "Other",
};

// ─── SCHOLARSHIP MECHANISMS ──────────────────────────────────

export const SCHOLARSHIP_MECHANISMS = [
  "automatic",
  "separate_application",
  "nomination",
  "university_application",
  "direct_application",
] as const;

export const SCHOLARSHIP_MECHANISM_LABELS: Record<string, string> = {
  automatic: "Automatic",
  separate_application: "Separate Application",
  nomination: "Nomination Required",
  university_application: "University Application",
  direct_application: "Direct Application",
};

// ─── DEGREE TYPES ────────────────────────────────────────────

export const DEGREE_TYPES = [
  "BSc",
  "BA",
  "MSc",
  "MEng",
  "MA",
  "MRes",
  "MPA",
  "MBA",
  "LLM",
  "MPhil",
  "PhD",
  "Other",
] as const;

// ─── TASK STATUSES ───────────────────────────────────────────

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

// ─── DEADLINE TYPES ──────────────────────────────────────────

export const DEADLINE_TYPES = [
  "application",
  "document",
  "funding",
  "test_score",
  "visa",
  "decision",
  "enrollment",
  "other",
] as const;

export const DEADLINE_TYPE_LABELS: Record<string, string> = {
  application: "Application",
  document: "Document",
  funding: "Funding",
  test_score: "Test Score",
  visa: "Visa",
  decision: "Decision",
  enrollment: "Enrollment",
  other: "Other",
};

// ─── EXPENSE CATEGORIES ──────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  "application_fee",
  "test_fee",
  "translation",
  "courier",
  "visa",
  "deposit",
  "travel",
  "accommodation",
  "insurance",
  "other",
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  application_fee: "Application Fee",
  test_fee: "Test Fee",
  translation: "Translation",
  courier: "Courier",
  visa: "Visa",
  deposit: "Deposit",
  travel: "Travel",
  accommodation: "Accommodation",
  insurance: "Insurance",
  other: "Other",
};

// ─── EXPENSE STATUSES ────────────────────────────────────────

export const EXPENSE_STATUSES = [
  "planned",
  "due",
  "paid",
  "waived",
  "refunded",
] as const;

export const EXPENSE_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  due: "Due",
  paid: "Paid",
  waived: "Waived",
  refunded: "Refunded",
};

// ─── RECOMMENDATION REQUEST STATUSES ────────────────────────

export const REC_REQUEST_STATUSES = [
  "pending",
  "sent",
  "accepted",
  "submitted",
  "declined",
] as const;

export const REC_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  sent: "Sent",
  accepted: "Accepted",
  submitted: "Submitted",
  declined: "Declined",
};

// ─── ESSAY STATUSES ──────────────────────────────────────────

export const ESSAY_STATUSES = [
  "not_started",
  "outlining",
  "drafting",
  "reviewing",
  "final",
  "submitted",
] as const;

export const ESSAY_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  outlining: "Outlining",
  drafting: "Drafting",
  reviewing: "Reviewing",
  final: "Final",
  submitted: "Submitted",
};

// ─── INTERACTION TYPES ───────────────────────────────────────

export const INTERACTION_TYPES = [
  "email",
  "phone",
  "meeting",
  "video_call",
  "other",
] as const;

export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  meeting: "In-Person Meeting",
  video_call: "Video Call",
  other: "Other",
};
