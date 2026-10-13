import Link from "next/link";
import { z } from "zod";
import { Plus, DollarSign, Award } from "lucide-react";
import { ApplicationExplorer } from "@/components/domain/application-explorer";
import { PageHeader } from "@/components/domain/page-header";
import { StatusBadge } from "@/components/domain/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileListItem, GroupedList } from "@/components/domain/mobile-list-item";
import { getApplicationPage } from "@/features/programs/actions";
import type { EntrySearch } from "@/features/entries/new-entry";
import { parsePage, pageBounds } from "@/lib/pagination";
import { PageNavigation } from "@/components/ui/page-navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EntryRetry } from "@/features/entries/retry";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<EntrySearch> }) {
  const search = await searchParams;
  const query = typeof search.q === "string" ? search.q.slice(0,120) : "";
  const status = typeof search.status === "string" ? search.status.slice(0,60) : "all";
  let applicationPage;
  try { applicationPage = await getApplicationPage({ query, status, page: parsePage(search.page) }); } catch { return <EntryRetry href="/dashboard" />; }
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const fundingPage = parsePage(search.funding_page);
  const expensePage = parsePage(search.expense_page);
  const [funding, spending] = await Promise.all([
    client.from("scholarship_applications").select("id,scholarship_id,status,scholarships!scholarship_applications_scholarship_owner_fkey(name,provider,funding_type)", { count: "exact" }).eq("user_id", user.id).is("archived_at", null).order("created_at", { ascending: false }).order("id").range((fundingPage - 1) * 24, fundingPage * 24 - 1),
    client.from("expenses").select("id,description,category,amount,currency_code,status,due_on", { count: "exact" }).eq("user_id", user.id).is("archived_at", null).order("created_at", { ascending: false }).order("id").range((expensePage - 1) * 24, expensePage * 24 - 1),
  ]);
  if (funding.error || spending.error) return <EntryRetry href="/dashboard" />;
  const parsedFunding = z.array(z.object({ id: z.string().uuid(), scholarship_id: z.string().uuid(), status: z.string(), scholarships: z.object({ name: z.string(), provider: z.string().nullable(), funding_type: z.string() }).nullable() })).safeParse(funding.data || []);
  if (!parsedFunding.success) return <EntryRetry href="/dashboard" />;
  const scholarshipApplications = parsedFunding.data;
  const expenses = spending.data || [];
  function pageHref(parameter: string, page: number, anchor: string) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) if (typeof value === "string") params.set(key, value);
    params.set(parameter, String(page));
    return `/applications?${params.toString()}#${anchor}`;
  }
  const fundingBounds = pageBounds(funding.count || 0, fundingPage);
  const expenseBounds = pageBounds(spending.count || 0, expensePage);
  if (fundingBounds.page !== fundingPage) redirect(pageHref("funding_page", fundingBounds.page, "funding"));
  if (expenseBounds.page !== expensePage) redirect(pageHref("expense_page", expenseBounds.page, "expenses"));

  return (
    <div className="workspace-page">
      <PageHeader
        title="Applications"
        description="Give every possibility a plan. Search, organize, and keep moving."
        action={
          <Button asChild size="icon" className="shadow-elevation-1 shrink-0 h-[44px] w-[44px] sm:h-[36px] sm:w-auto sm:px-4">
            <Link href="/applications/new">
              <Plus className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">New application</span>
            </Link>
          </Button>
        }
      />

      <ApplicationExplorer key={JSON.stringify([query,status,applicationPage.page])} applications={applicationPage.items} pagination={applicationPage} initialQuery={query} initialStatus={status} initialView={search.view === "board" ? "board" : "list"} />

      {/* Scholarship Applications */}
      {scholarshipApplications.length > 0 && (
        <div id="funding" className="mt-8">
          <h2 className="text-[20px] font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground/40" /> Scholarship Applications
          </h2>
          <div className="mt-4 hidden sm:block">
            <Card>
              <CardContent className="p-0">
                {scholarshipApplications.map((sa) => (
                  <Link key={sa.id} href={`/scholarships/${sa.scholarship_id}`}
                    className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0 hover:bg-accent/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium truncate">{sa.scholarships?.name}</p>
                      <p className="text-[13px] text-muted-foreground">{sa.scholarships?.provider || sa.scholarships?.funding_type}</p>
                    </div>
                    <StatusBadge status={sa.status === "awarded" ? "done" : sa.status === "submitted" ? "submitted" : "preparing"} label={sa.status.replace("_", " ")} />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 sm:hidden">
            <GroupedList>
              {scholarshipApplications.map((sa, i) => (
                <Link key={sa.id} href={`/scholarships/${sa.scholarship_id}`}>
                  <MobileListItem index={i} title={sa.scholarships?.name || "Scholarship"} subtitle={sa.scholarships?.provider || ""} badge={<StatusBadge status={sa.status === "awarded" ? "done" : "preparing"} label={sa.status.replace("_", " ")} />} />
                </Link>
              ))}
            </GroupedList>
          </div>
          <PageNavigation label="Scholarship application pagination" page={fundingPage} total={funding.count || 0} links={{ previous: pageHref("funding_page", fundingPage - 1, "funding"), next: pageHref("funding_page", fundingPage + 1, "funding") }} />
        </div>
      )}

      {/* Expenses */}
      {expenses.length > 0 && (
        <div id="expenses" className="mt-8">
          <h2 className="text-[20px] font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground/40" /> Expenses
          </h2>
          <div className="mt-4">
            <Card>
              <CardContent className="p-0">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between gap-4 border-b border-border/20 px-6 py-4 last:border-b-0">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium truncate">{expense.description}</p>
                      <p className="text-[13px] text-muted-foreground capitalize">{expense.category.replace("_", " ")}{expense.due_on ? ` · Due ${new Date(expense.due_on).toLocaleDateString()}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-medium">{expense.currency_code} {Number(expense.amount).toLocaleString()}</p>
                      <StatusBadge status={expense.status === "paid" ? "done" : expense.status === "due" ? "submitted" : "draft"} label={expense.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <PageNavigation label="Expense pagination" page={expensePage} total={spending.count || 0} links={{ previous: pageHref("expense_page", expensePage - 1, "expenses"), next: pageHref("expense_page", expensePage + 1, "expenses") }} />
        </div>
      )}
    </div>
  );
}
