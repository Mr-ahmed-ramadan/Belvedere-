import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { visibilityFilter } from "@/lib/visibility";
import {
  PageHeader,
  EmptyState,
  LinkButton,
  VisibilityBadge,
  formatDate,
} from "@/components/ui";

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where: Prisma.DecisionWhereInput = {
    ...visibilityFilter(user.role),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { detail: { contains: query } },
          ],
        }
      : {}),
  };

  const decisions = await prisma.decision.findMany({
    where,
    orderBy: { decidedAt: "desc" },
    include: { meeting: { select: { id: true, title: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Decisions register"
        description="A searchable record of decisions made by the board."
        action={
          admin ? (
            <LinkButton href="/decisions/new" variant="primary">
              Record decision
            </LinkButton>
          ) : null
        }
      />

      <form method="get" className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search decisions…"
          className="input max-w-sm"
        />
        <button type="submit" className="btn">
          Search
        </button>
        {query ? (
          <Link href="/decisions" className="btn">
            Clear
          </Link>
        ) : null}
      </form>

      {decisions.length === 0 ? (
        <EmptyState>
          {query ? "No decisions match your search." : "No decisions recorded yet."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {decisions.map((d) => (
            <li key={d.id} id={d.id} className="card scroll-mt-24">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{d.title}</h2>
                  <p className="text-xs text-gray-500">
                    {formatDate(d.decidedAt)}
                    {d.meeting ? (
                      <>
                        {" · from "}
                        <Link
                          href={`/meetings/${d.meeting.id}`}
                          className="link"
                        >
                          {d.meeting.title}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
                {admin ? <VisibilityBadge visibility={d.visibility} /> : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                {d.detail}
              </p>
              {admin ? (
                <div className="mt-3">
                  <Link href={`/decisions/${d.id}/edit`} className="link text-sm">
                    Edit
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
