import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin, canViewFinance } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import {
  announcementFilter,
  visibilityFilter,
  projectFilter,
} from "@/lib/visibility";
import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/constants";
import {
  PageHeader,
  Badge,
  formatDate,
  formatDateTime,
} from "@/components/ui";
import { SearchBox } from "@/components/search-box";

export default async function DashboardPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const showFinance = canViewFinance(user.role);
  const now = new Date();

  const reserveBalance = showFinance
    ? (await prisma.reserveFundEntry.aggregate({ _sum: { amount: true } }))._sum
        .amount ?? 0
    : 0;

  const [announcements, upcomingMeetings, openProjects, recentDecisions, drafts] =
    await Promise.all([
      prisma.announcement.findMany({
        where: announcementFilter(user.role),
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        include: { author: { select: { name: true } } },
      }),
      prisma.meeting.findMany({
        where: {
          ...visibilityFilter(user.role),
          scheduledAt: { gte: now },
          status: "SCHEDULED",
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      prisma.project.findMany({
        where: {
          ...projectFilter(user.role, user.id),
          status: { not: "DONE" },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: { assignee: { select: { name: true } } },
      }),
      prisma.decision.findMany({
        where: visibilityFilter(user.role),
        orderBy: { decidedAt: "desc" },
        take: 3,
      }),
      admin
        ? prisma.announcement.count({ where: { publishedAt: null } })
        : Promise.resolve(0),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome, ${user.name}`} />

      <SearchBox />

      {showFinance ? (
        <Link
          href="/finance"
          className="card flex items-center justify-between hover:border-blue-400"
        >
          <div>
            <p className="text-sm text-gray-500">Reserve fund balance</p>
            <p className="text-2xl font-bold">{formatMoney(reserveBalance)}</p>
          </div>
          <span className="link text-sm">View finance →</span>
        </Link>
      ) : null}

      {admin && drafts > 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          You have {drafts} unpublished announcement draft(s).{" "}
          <Link href="/announcements" className="underline">
            Review
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Announcements */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest announcements</h2>
            <Link href="/announcements" className="link text-sm">
              All
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing yet.</p>
          ) : (
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium">{a.title}</span>
                  {!a.publishedAt ? (
                    <Badge className="ml-2 bg-amber-100 text-amber-800">
                      Draft
                    </Badge>
                  ) : null}
                  <div className="text-xs text-gray-500">
                    {a.publishedAt ? formatDate(a.publishedAt) : "unpublished"} ·{" "}
                    {a.author.name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming meetings */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming meetings</h2>
            <Link href="/meetings" className="link text-sm">
              All
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-gray-500">No meetings scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingMeetings.map((m) => (
                <li key={m.id} className="text-sm">
                  <Link href={`/meetings/${m.id}`} className="font-medium link">
                    {m.title}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(m.scheduledAt)}
                    {m.location ? ` · ${m.location}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Projects */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {admin ? "Open projects" : "Your / public projects"}
            </h2>
            <Link href="/projects" className="link text-sm">
              All
            </Link>
          </div>
          {openProjects.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing open.</p>
          ) : (
            <ul className="space-y-2">
              {openProjects.map((p) => (
                <li key={p.id} className="text-sm">
                  <Link href={`/projects/${p.id}`} className="font-medium link">
                    {p.title}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                    {p.assignee ? ` · ${p.assignee.name}` : ""}
                    {p.dueDate ? ` · due ${formatDate(p.dueDate)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Decisions */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent decisions</h2>
            <Link href="/decisions" className="link text-sm">
              All
            </Link>
          </div>
          {recentDecisions.length === 0 ? (
            <p className="text-sm text-gray-500">No decisions recorded.</p>
          ) : (
            <ul className="space-y-2">
              {recentDecisions.map((d) => (
                <li key={d.id} className="text-sm">
                  <span className="font-medium">{d.title}</span>
                  <div className="text-xs text-gray-500">
                    {formatDate(d.decidedAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
