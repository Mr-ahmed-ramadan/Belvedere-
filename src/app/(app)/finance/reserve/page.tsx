import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import { PageHeader, EmptyState, formatDate } from "@/components/ui";
import { AddReserveEntryForm } from "../finance-forms";
import { deleteReserveEntryAction } from "../actions";

export default async function ReserveFundPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const entries = await prisma.reserveFundEntry.findMany({
    orderBy: { date: "asc" },
  });

  // Build a running balance oldest → newest, then display newest first.
  let running = 0;
  const withBalance = entries.map((e) => {
    running += e.amount;
    return { ...e, balance: running };
  });
  withBalance.reverse();
  const total = running;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reserve fund"
        description="The building's savings for future major works. Current balance below."
      />

      <div className="card">
        <p className="text-sm text-gray-500">Current balance</p>
        <p className="text-3xl font-bold">{formatMoney(total)}</p>
      </div>

      {admin ? (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Add an entry</h2>
          <AddReserveEntryForm />
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ledger</h2>
        {withBalance.length === 0 ? (
          <EmptyState>No entries yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  {admin ? <th className="px-3 py-2"></th> : null}
                </tr>
              </thead>
              <tbody>
                {withBalance.map((e) => (
                  <tr key={e.id} className="border-t border-gray-200">
                    <td className="px-3 py-2 text-gray-600">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-3 py-2">{e.description}</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        e.amount < 0 ? "text-red-700" : "text-green-700"
                      }`}
                    >
                      {e.amount < 0 ? "" : "+"}
                      {formatMoney(e.amount)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatMoney(e.balance)}
                    </td>
                    {admin ? (
                      <td className="px-3 py-2 text-right">
                        <form action={deleteReserveEntryAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button
                            type="submit"
                            className="link text-xs text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
