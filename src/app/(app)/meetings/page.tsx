import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { visibilityFilter } from "@/lib/visibility";
import {
  MEETING_KIND_LABELS,
  MEETING_STATUS_LABELS,
  type MeetingKind,
  type MeetingStatus,
} from "@/lib/constants";
import {
  PageHeader,
  EmptyState,
  LinkButton,
  Badge,
  VisibilityBadge,
  formatDateTime,
} from "@/components/ui";

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  HELD: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
};

export default async function MeetingsPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const meetings = await prisma.meeting.findMany({
    where: visibilityFilter(user.role),
    orderBy: { scheduledAt: "desc" },
    include: { _count: { select: { decisions: true } } },
  });

  const now = new Date();
  const upcoming = meetings
    .filter((m) => m.scheduledAt >= now && m.status === "SCHEDULED")
    .reverse();
  const past = meetings.filter(
    (m) => m.scheduledAt < now || m.status !== "SCHEDULED",
  );

  const renderItem = (m: (typeof meetings)[number]) => (
    <li key={m.id} className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/meetings/${m.id}`} className="text-lg font-semibold link">
            {m.title}
          </Link>
          <p className="text-xs text-gray-500">
            {formatDateTime(m.scheduledAt)}
            {m.location ? ` · ${m.location}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge className={STATUS_STYLES[m.status] ?? ""}>
            {MEETING_STATUS_LABELS[m.status as MeetingStatus]}
          </Badge>
          {admin ? <VisibilityBadge visibility={m.visibility} /> : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {MEETING_KIND_LABELS[m.kind as MeetingKind]}
        {m._count.decisions > 0
          ? ` · ${m._count.decisions} decision(s)`
          : ""}
      </p>
    </li>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meetings"
        description="Board and general meetings, agendas and minutes."
        action={
          admin ? (
            <LinkButton href="/meetings/new" variant="primary">
              New meeting
            </LinkButton>
          ) : null
        }
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyState>No upcoming meetings.</EmptyState>
        ) : (
          <ul className="space-y-3">{upcoming.map(renderItem)}</ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Past &amp; other</h2>
        {past.length === 0 ? (
          <EmptyState>No past meetings yet.</EmptyState>
        ) : (
          <ul className="space-y-3">{past.map(renderItem)}</ul>
        )}
      </section>
    </div>
  );
}
