import Link from "next/link";
import { ArrowLeft, User, Calendar, Globe, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/domain/page-header";

// Approximate exchange rates (USD base)
const FX_RATES: Record<string, number> = {
  GHS: 15.5,
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  CAD: 1.36,
  CNY: 7.24,
  JPY: 149.5,
  XAF: 605,
  XOF: 605,
  SEK: 10.4,
  NOK: 10.6,
  DKK: 6.85,
  PLN: 3.95,
  CZK: 22.8,
  HUF: 358,
  AUD: 1.53,
  NGN: 1550,
  KES: 153,
  ZAR: 18.2,
  ETB: 56,
  EGP: 48.5,
  MAD: 9.8,
  TZS: 2520,
  UGX: 3750,
  GMD: 68,
  NZD: 1.63,
  SGD: 1.34,
  KRW: 1330,
  INR: 83.5,
  BRL: 4.97,
};

function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = FX_RATES[fromCurrency];
  if (!rate) return 0;
  return amount / rate;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: any = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // Fetch all expenses for totals
  let expenses: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("expenses")
      .select("amount, currency_code, status")
      .eq("user_id", user.id)
      .is("archived_at", null);
    expenses = data || [];
  }

  // Calculate totals by currency
  const totalsByCurrency: Record<string, { paid: number; planned: number }> = {};
  for (const e of expenses) {
    const cur = e.currency_code || "USD";
    if (!totalsByCurrency[cur]) totalsByCurrency[cur] = { paid: 0, planned: 0 };
    if (e.status === "paid") {
      totalsByCurrency[cur].paid += Number(e.amount) || 0;
    } else {
      totalsByCurrency[cur].planned += Number(e.amount) || 0;
    }
  }

  // Convert to target currencies
  const totalPaidUSD = Object.entries(totalsByCurrency).reduce(
    (sum, [cur, t]) => sum + convertToUSD(t.paid, cur), 0
  );
  const totalPlannedUSD = Object.entries(totalsByCurrency).reduce(
    (sum, [cur, t]) => sum + convertToUSD(t.planned, cur), 0
  );

  const targetCurrencies = [
    { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Link>

      <PageHeader
        title="Profile"
        description="Your account details and financial summary."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</p>
              <p className="text-sm font-medium mt-1">{profile?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium mt-1">{user?.email || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Intake</p>
              <p className="text-sm font-medium mt-1">{profile?.target_intake_year || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timezone</p>
              <p className="text-sm font-medium mt-1">{profile?.timezone || "Not set"}</p>
            </div>
            {profile?.expected_graduation_date && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected Graduation</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(profile.expected_graduation_date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {targetCurrencies.map(({ code, label, symbol }) => {
              const rate = FX_RATES[code] || 1;
              const paid = totalPaidUSD * rate;
              const planned = totalPlannedUSD * rate;
              return (
                <div key={code} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label} ({code})</span>
                    <span className="text-xs text-muted-foreground">1 USD ≈ {rate} {code}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="text-lg font-bold text-green-600">
                        {symbol}{paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Planned</p>
                      <p className="text-lg font-bold text-amber-600">
                        {symbol}{planned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Breakdown by original currency */}
            {Object.keys(totalsByCurrency).length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Breakdown by Currency
                </p>
                <div className="space-y-1">
                  {Object.entries(totalsByCurrency)
                    .sort(([, a], [, b]) => (b.paid + b.planned) - (a.paid + a.planned))
                    .map(([cur, t]) => (
                      <div key={cur} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cur}</span>
                        <div className="text-right">
                          <span className="text-green-600">{t.paid.toLocaleString()} paid</span>
                          {t.planned > 0 && (
                            <span className="text-muted-foreground ml-2">+ {t.planned.toLocaleString()} planned</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(totalsByCurrency).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
