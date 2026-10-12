import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import { PageHeader, Badge, VisibilityBadge } from "@/components/ui";
import { AddBudgetLineForm } from "../../finance-forms";
import {
  updateBudgetLineAction,
  deleteBudgetLineAction,
  deleteBudgetAction,
} from "../../actions";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const { id } = await params;

  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { lines: { orderBy: { order: "asc" } } },
  });
  if (!budget) notFound();
  if (!admin && budget.visibility !== "PUBLIC") notFound();

  const totalBudgeted = budget.lines.reduce((s, l) => s + l.budgeted, 0);
  const totalActual = budget.lines.reduce((s, l) => s + l.actual, 0);
  const totalVariance = totalBudgeted - totalActual;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${budget.year} ${budget.title ? `· ${budget.title}` : "budget"}`}
        action={admin ? <VisibilityBadge visibility={budget.visibility} /> : undefined}
      />
      {budget.note ? (
        <p className="text-sm text-gray-600">{budget.note}</p>
      ) : null}

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">Budgeted</th>
              <th className="px-3 py-2 text-right">Actual</th>
              <th className="px-3 py-2 text-right">Variance</th>
              {admin ? <th className="px-3 py-2"></th> : null}
            </tr>
          </thead>
          <tbody>
            {budget.lines.length === 0 ? (
              <tr>
                <td
                  colSpan={admin ? 5 : 4}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  No line items yet.
                </td>
              </tr>
            ) : (
              budget.lines.map((l) => {
                const variance = l.budgeted - l.actual;
                return (
                  <tr key={l.id} className="border-t border-gray-200">
                    {admin ? (
                      <>
                        <td className="px-3 py-2" colSpan={3}>
                          <form
                            action={updateBudgetLineAction}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <input type="hidden" name="id" value={l.id} />
                            <input
                              type="hidden"
                              name="budgetId"
                              value={budget.id}
                            />
                            <input
                              name="category"
                              defaultValue={l.category}
                              className="input grow"
                            />
                            <input
                              name="budgeted"
                              defaultValue={String(l.budgeted)}
                              className="input w-28"
                              aria-label="Budgeted"
                            />
                            <input
                              name="actual"
                              defaultValue={String(l.actual)}
                              className="input w-28"
                              aria-label="Actual"
                            />
                            <button type="submit" className="btn">
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatMoney(variance)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <form action={deleteBudgetLineAction}>
                            <input type="hidden" name="id" value={l.id} />
                            <input
                              type="hidden"
                              name="budgetId"
                              value={budget.id}
                            />
                            <button
                              type="submit"
                              className="link text-xs text-red-700"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2">{l.category}</td>
                        <td className="px-3 py-2 text-right">
                          {formatMoney(l.budgeted)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatMoney(l.actual)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${
                            variance < 0 ? "text-red-700" : ""
                          }`}
                        >
                          {formatMoney(variance)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-semibold">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right">
                {formatMoney(totalBudgeted)}
              </td>
              <td className="px-3 py-2 text-right">{formatMoney(totalActual)}</td>
              <td
                className={`px-3 py-2 text-right ${
                  totalVariance < 0 ? "text-red-700" : ""
                }`}
              >
                {formatMoney(totalVariance)}
              </td>
              {admin ? <td></td> : null}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Variance = budgeted − actual. A negative figure (red) means spending is
        over budget.
      </p>

      {admin ? (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Add a line</h2>
          <AddBudgetLineForm budgetId={budget.id} />
        </section>
      ) : null}

      {admin ? (
        <form action={deleteBudgetAction}>
          <input type="hidden" name="id" value={budget.id} />
          <button type="submit" className="btn btn-danger">
            Delete budget
          </button>
        </form>
      ) : null}
    </div>
  );
}
