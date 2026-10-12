import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { SECTION } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import {
  PageHeader,
  EmptyState,
  LinkButton,
  Badge,
  VisibilityBadge,
  formatDate,
} from "@/components/ui";
import { InfoPageList, type InfoPageItem } from "../_infopages/info-page-list";

export default async function FinancePage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const visFilter = admin ? {} : { visibility: "PUBLIC" };

  const [entries, budgets, pages] = await Promise.all([
    prisma.reserveFundEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.budget.findMany({
      where: visFilter,
      orderBy: { year: "desc" },
      include: { lines: true },
    }),
    prisma.infoPage.findMany({
      where: { section: SECTION.FINANCE, ...visFilter },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      include: { document: { select: { id: true, title: true } } },
    }),
  ]);

  const reserveBalance = entries.reduce((sum, e) => sum + e.amount, 0);
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Finance"
        description="The management company's financial position — reserve fund, budgets, statements and strategy."
      />

      {/* Reserve fund */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reserve fund</h2>
          <Link href="/finance/reserve" className="link text-sm">
            Full ledger
          </Link>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Current balance</p>
          <p className="text-3xl font-bold">{formatMoney(reserveBalance)}</p>
          {recentEntries.length > 0 ? (
            <ul className="mt-4 divide-y divide-gray-100 text-sm">
              {recentEntries.map((e) => (
                <li key={e.id} className="flex justify-between py-1.5">
                  <span>
                    <span className="text-gray-500">{formatDate(e.date)}</span>{" "}
                    {e.description}
                  </span>
                  <span
                    className={
                      e.amount < 0 ? "text-red-700" : "text-green-700"
                    }
                  >
                    {e.amount < 0 ? "" : "+"}
                    {formatMoney(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No entries yet.</p>
          )}
        </div>
      </section>

      {/* Budgets */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Budgets</h2>
          {admin ? (
            <LinkButton href="/finance/budgets/new" variant="primary">
              New budget
            </LinkButton>
          ) : null}
        </div>
        {budgets.length === 0 ? (
          <EmptyState>No budgets yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {budgets.map((b) => {
              const budgeted = b.lines.reduce((s, l) => s + l.budgeted, 0);
              const actual = b.lines.reduce((s, l) => s + l.actual, 0);
              return (
                <li key={b.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/finance/budgets/${b.id}`}
                        className="font-semibold link"
                      >
                        {b.year} {b.title ? `· ${b.title}` : "budget"}
                      </Link>
                      <p className="text-xs text-gray-500">
                        Budgeted {formatMoney(budgeted)} · Actual{" "}
                        {formatMoney(actual)}
                      </p>
                    </div>
                    {admin ? <VisibilityBadge visibility={b.visibility} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Statements & strategy */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Statements &amp; strategy</h2>
          {admin ? (
            <LinkButton href="/finance/pages/new">Add page</LinkButton>
          ) : null}
        </div>
        <InfoPageList
          pages={pages as InfoPageItem[]}
          admin={admin}
          editBase="/finance/pages"
          returnTo="/finance"
          emptyText="No financial statements or strategy notes yet."
        />
      </section>

      {!admin ? (
        <p className="text-xs text-gray-400">
          <Badge className="bg-gray-100 text-gray-600">View only</Badge> You can
          view the building&apos;s finances. Only the board can make changes.
        </p>
      ) : null}
    </div>
  );
}
