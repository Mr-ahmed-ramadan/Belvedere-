import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  announcementFilter,
  visibilityFilter,
  projectFilter,
} from "@/lib/visibility";
import { PageHeader, EmptyState, formatDate } from "@/components/ui";
import { SearchBox } from "@/components/search-box";

type Result = { href: string; title: string; context: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let groups: { label: string; results: Result[] }[] = [];

  if (query) {
    const like = { contains: query };
    const [announcements, meetings, decisions, documents, projects] =
      await Promise.all([
        prisma.announcement.findMany({
          where: {
            AND: [
              announcementFilter(user.role),
              { OR: [{ title: like }, { body: like }] },
            ],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
        prisma.meeting.findMany({
          where: {
            AND: [
              visibilityFilter(user.role),
              { OR: [{ title: like }, { agenda: like }, { minutes: like }] },
            ],
          },
          take: 10,
          orderBy: { scheduledAt: "desc" },
        }),
        prisma.decision.findMany({
          where: {
            AND: [
              visibilityFilter(user.role),
              { OR: [{ title: like }, { detail: like }] },
            ],
          },
          take: 10,
          orderBy: { decidedAt: "desc" },
        }),
        prisma.document.findMany({
          where: {
            AND: [
              visibilityFilter(user.role),
              { OR: [{ title: like }, { originalName: like }, { category: like }] },
            ],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
          where: {
            AND: [
              projectFilter(user.role, user.id),
              { OR: [{ title: like }, { description: like }] },
            ],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    groups = [
      {
        label: "Announcements",
        results: announcements.map((a) => ({
          href: "/announcements",
          title: a.title,
          context: a.publishedAt ? formatDate(a.publishedAt) : "Draft",
        })),
      },
      {
        label: "Meetings",
        results: meetings.map((m) => ({
          href: `/meetings/${m.id}`,
          title: m.title,
          context: formatDate(m.scheduledAt),
        })),
      },
      {
        label: "Decisions",
        results: decisions.map((d) => ({
          href: `/decisions#${d.id}`,
          title: d.title,
          context: formatDate(d.decidedAt),
        })),
      },
      {
        label: "Documents",
        results: documents.map((d) => ({
          href: `/api/documents/${d.id}/download`,
          title: d.title,
          context: d.originalName,
        })),
      },
      {
        label: "Projects",
        results: projects.map((p) => ({
          href: `/projects/${p.id}`,
          title: p.title,
          context: p.status,
        })),
      },
    ].filter((g) => g.results.length > 0);
  }

  const total = groups.reduce((n, g) => n + g.results.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Search" />
      <SearchBox defaultValue={query} />

      {!query ? (
        <p className="text-sm text-gray-500">
          Enter a term to search across the building records you can access.
        </p>
      ) : total === 0 ? (
        <EmptyState>No results for “{query}”.</EmptyState>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                {g.label} ({g.results.length})
              </h2>
              <ul className="space-y-2">
                {g.results.map((r, i) => (
                  <li key={i} className="card">
                    <Link href={r.href} className="font-medium link">
                      {r.title}
                    </Link>
                    <div className="text-xs text-gray-500">{r.context}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
