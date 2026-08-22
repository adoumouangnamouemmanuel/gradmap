// Shared constants derived from the GradMap Excel sheet Setup tab.
// Keep this file as the single source of truth for dropdown values.

export const CURRENCIES = [
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "XAF", label: "XAF — CFA Franc" },
  { code: "SEK", label: "SEK — Swedish Krona" },
  { code: "NOK", label: "NOK — Norwegian Krone" },
  { code: "DKK", label: "DKK — Danish Krone" },
  { code: "PLN", label: "PLN — Polish Zloty" },
  { code: "CZK", label: "CZK — Czech Koruna" },
  { code: "HUF", label: "HUF — Hungarian Forint" },
  { code: "AUD", label: "AUD — Australian Dollar" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export const COUNTRIES = [
  "France",
  "Germany",
  "United Kingdom",
  "Netherlands",
  "Switzerland",
  "Canada",
  "United States",
  "China",
  "Japan",
  "Erasmus Mundus (Multi-country)",
  "Other",
] as const;

export const FUNDING_TYPES = [
  "full",
  "partial",
  "stipend",
  "tuition",
  "loan",
  "fellowship",
  "government_sponsorship",
  "other",
  "unknown",
] as const;

export const FUNDING_TYPE_LABELS: Record<string, string> = {
  full: "Full Scholarship",
  partial: "Partial Tuition",
  stipend: "Stipend Only",
  tuition: "Tuition Waiver",
  loan: "Loan",
  fellowship: "Fellowship",
  government_sponsorship: "Government Sponsorship",
  other: "Other",
  unknown: "Unknown / To verify",
};

export const SCHOLARSHIP_MECHANISMS = [
  "automatic",
  "separate",
  "nomination",
  "university_application",
  "direct_application",
  "unknown",
] as const;

export const SCHOLARSHIP_MECHANISM_LABELS: Record<string, string> = {
  automatic: "Automatic",
  separate: "Separate application",
  nomination: "Nomination required",
  university_application: "University application",
  direct_application: "Direct application",
  unknown: "Unknown",
};

export const EXPENSE_CATEGORIES = [
  "application_fee",
  "test",
  "translation",
  "courier",
  "visa",
  "deposit",
  "other",
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  application_fee: "Application Fee",
  test: "Test Fee",
  translation: "Translation",
  courier: "Courier",
  visa: "Visa",
  deposit: "Deposit",
  other: "Other",
};

export const PROGRAM_STATUSES = [
  "exploring",
  "shortlisted",
  "applying",
  "applied",
  "closed",
  "archived",
] as const;

export const APPLICATION_STATUSES = [
  "researching",
  "shortlisted",
  "preparing",
  "ready",
  "submitted",
  "interview",
  "waitlisted",
  "admitted",
  "rejected",
  "withdrawn",
  "deferred",
  "enrolled",
] as const;

export const SCHOLARSHIP_STATUSES = [
  "researching",
  "eligible",
  "preparing",
  "nomination_pending",
  "submitted",
  "interview",
  "awarded",
  "reserve",
  "rejected",
  "withdrawn",
  "not_required",
] as const;

export const ELIGIBILITY_STATUSES = [
  "unknown",
  "likely",
  "eligible",
  "ineligible",
  "needs_verification",
] as const;

export const DEGREE_TYPES = [
  "MSc",
  "MEng",
  "MA",
  "MRes",
  "MPA",
  "LLM",
  "PhD",
  "Other",
] as const;
