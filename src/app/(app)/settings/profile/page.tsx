import Link from "next/link";
import { ArrowLeft, User, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/domain/page-header";
import { GroupedList, MobileListItem } from "@/components/domain/mobile-list-item";
import { FadeIn } from "@/components/ui/motion-wrapper";

const FX_RATES: Record<string, number> = {
  GHS: 15.5, USD: 1, EUR: 0.92, GBP: 0.79, CHF: 0.88, CAD: 1.36, AUD: 1.53, NZD: 1.63, SGD: 1.34,
  NGN: 1550, KES: 153, ZAR: 18.2, ETB: 56, EGP: 48.5, MAD: 9.8, TZS: 2520, UGX: 3750, GMD: 68,
  XAF: 605, XOF: 605, KRW: 1330, INR: 83.5, BRL: 4.97, CNY: 7.24, JPY: 149.5,
  SEK: 10.4, NOK: 10.6, DKK: 6.85, PLN: 3.95, CZK: 22.8, HUF: 358,
};

function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = FX_RATES[fromCurrency];
  return rate ? amount / rate : 0;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: any = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  let expenses: any[] = [];
  if (user) {
    const { data } = await supabase.from("expenses").select("amount, currency_code, status").eq("user_id", user.id).is("archived_at", null);
    expenses = data || [];
  }

  const totals: Record<string, { paid: number; planned: number }> = {};
  for (const e of expenses) {
    const cur = e.currency_code || "USD";
    if (!totals[cur]) totals[cur] = { paid: 0, planned: 0 };
    if (e.status === "paid") totals[cur].paid += Number(e.amount) || 0;
    else totals[cur].planned += Number(e.amount) || 0;
  }

  const totalPaidUSD = Object.entries(totals).reduce((s, [c, t]) => s + convertToUSD(t.paid, c), 0);
  const totalPlannedUSD = Object.entries(totals).reduce((s, [c, t]) => s + convertToUSD(t.planned, c), 0);

  const targetCurrencies = [
    { code: "GHS", symbol: "GH₵" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
  ];

  const profileItems = [
    { label: "Name", value: profile?.full_name || "Not set" },
    { label: "Email", value: user?.email || "Not set" },
    { label: "Target Intake", value: profile?.target_intake_year || "Not set" },
    { label: "Timezone", value: profile?.timezone || "Not set" },
  ];

  if (profile?.expected_graduation_date) {
    profileItems.push({
      label: "Graduation",
      value: new Date(profile.expected_graduation_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground press-apple">
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>

      <PageHeader title="Profile" description="Your account details and financial summary." />

      <div className="mt-4 space-y-6 max-w-lg">
        {/* Account info as grouped list */}
        <FadeIn delay={0.1}>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-4">Account</p>
          <GroupedList>
            {profileItems.map((item) => (
              <MobileListItem
                key={item.label}
                title={item.label}
                subtitle={item.value}
                showChevron={false}
              />
            ))}
          </GroupedList>
        </FadeIn>

        {/* Financial Summary */}
        <FadeIn delay={0.2}>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-4">Financial Summary</p>
          {totalPaidUSD + totalPlannedUSD > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {targetCurrencies.map(({ code, symbol }) => {
                const rate = FX_RATES[code] || 1;
                const paid = totalPaidUSD * rate;
                const planned = totalPlannedUSD * rate;
                return (
                  <Card key={code}>
                    <CardContent className="p-4 text-center">
                      <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">{code}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Paid</p>
                      <p className="text-[18px] font-semibold text-emerald-600 tabular-nums">{symbol}{paid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Planned</p>
                      <p className="text-[18px] font-semibold text-amber-600 tabular-nums">{symbol}{planned.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <GroupedList>
              <MobileListItem title="No expenses recorded" showChevron={false} />
            </GroupedList>
          )}
        </FadeIn>

        {/* Currency breakdown */}
        {Object.keys(totals).length > 0 && (
          <FadeIn delay={0.3}>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-4">By Currency</p>
            <GroupedList>
              {Object.entries(totals)
                .sort(([, a], [, b]) => (b.paid + b.planned) - (a.paid + a.planned))
                .map(([cur, t]) => (
                  <MobileListItem
                    key={cur}
                    title={cur}
                    subtitle={`${t.paid.toLocaleString()} paid${t.planned > 0 ? ` · ${t.planned.toLocaleString()} planned` : ""}`}
                    showChevron={false}
                  />
                ))
              }
            </GroupedList>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
