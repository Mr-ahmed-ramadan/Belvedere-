import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin, canSeeVisibility } from "@/lib/permissions";
import {
  MEETING_KIND_LABELS,
  MEETING_STATUS_LABELS,
  type MeetingKind,
  type MeetingStatus,
} from "@/lib/constants";
import {
  PageHeader,
  Badge,
  VisibilityBadge,
  formatDateTime,
  formatDate,
} from "@/components/ui";
import {
  saveMinutesAction,
  addAttendeeAction,
  toggleAttendeeAction,
  removeAttendeeAction,
} from "../actions";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      attendees: { include: { user: { select: { name: true } } } },
      decisions: { orderBy: { decidedAt: "desc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!meeting) notFound();
  if (!canSeeVisibility(user.role, meeting.visibility)) notFound();

  const attendeeUserIds = new Set(meeting.attendees.map((a) => a.userId));
  const availableUsers = admin
    ? await prisma.user.findMany({
        where: { active: true, id: { notIn: Array.from(attendeeUserIds) } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  const visibleDecisions = meeting.decisions.filter((d) =>
    canSeeVisibility(user.role, d.visibility),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={meeting.title}
        description={`${MEETING_KIND_LABELS[meeting.kind as MeetingKind]} · ${formatDateTime(
          meeting.scheduledAt,
        )}${meeting.location ? ` · ${meeting.location}` : ""}`}
        action={
          admin ? (
            <Link href={`/meetings/${meeting.id}/edit`} className="btn">
              Edit
            </Link>
          ) : null
        }
      />

      <div className="flex gap-2">
        <Badge>{MEETING_STATUS_LABELS[meeting.status as MeetingStatus]}</Badge>
        {admin ? <VisibilityBadge visibility={meeting.visibility} /> : null}
      </div>

      {meeting.agenda ? (
        <section className="card">
          <h2 className="mb-2 text-lg font-semibold">Agenda</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {meeting.agenda}
          </p>
        </section>
      ) : null}

      {/* Minutes */}
      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">Minutes</h2>
        {admin ? (
          <form action={saveMinutesAction} className="space-y-3">
            <input type="hidden" name="id" value={meeting.id} />
            <textarea
              name="minutes"
              rows={8}
              defaultValue={meeting.minutes ?? ""}
              placeholder="Record what was discussed and agreed…"
              className="input"
            />
            <div className="flex items-center gap-4">
              <button type="submit" className="btn btn-primary">
                Save minutes
              </button>
              {meeting.status !== "HELD" ? (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="markHeld" value="1" />
                  Mark meeting as held
                </label>
              ) : null}
            </div>
          </form>
        ) : meeting.minutes ? (
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {meeting.minutes}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Minutes not published yet.</p>
        )}
      </section>

      {/* Attendees */}
      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">
          Attendees ({meeting.attendees.length})
        </h2>
        {meeting.attendees.length === 0 ? (
          <p className="text-sm text-gray-500">No attendees recorded.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {meeting.attendees.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>
                  {a.user.name}{" "}
                  <Badge
                    className={
                      a.present
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {a.present ? "Present" : "Absent"}
                  </Badge>
                </span>
                {admin ? (
                  <span className="flex gap-2">
                    <form action={toggleAttendeeAction}>
                      <input type="hidden" name="meetingId" value={meeting.id} />
                      <input type="hidden" name="attendeeId" value={a.id} />
                      <button type="submit" className="link text-xs">
                        Mark {a.present ? "absent" : "present"}
                      </button>
                    </form>
                    <form action={removeAttendeeAction}>
                      <input type="hidden" name="meetingId" value={meeting.id} />
                      <input type="hidden" name="attendeeId" value={a.id} />
                      <button type="submit" className="link text-xs text-red-700">
                        Remove
                      </button>
                    </form>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {admin && availableUsers.length > 0 ? (
          <form action={addAttendeeAction} className="mt-3 flex gap-2">
            <input type="hidden" name="meetingId" value={meeting.id} />
            <select name="userId" className="input w-auto" defaultValue="">
              <option value="" disabled>
                Add attendee…
              </option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        ) : null}
      </section>

      {/* Decisions */}
      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decisions from this meeting</h2>
          {admin ? (
            <Link
              href={`/decisions/new?meetingId=${meeting.id}`}
              className="btn"
            >
              Record decision
            </Link>
          ) : null}
        </div>
        {visibleDecisions.length === 0 ? (
          <p className="text-sm text-gray-500">No decisions recorded.</p>
        ) : (
          <ul className="space-y-2">
            {visibleDecisions.map((d) => (
              <li key={d.id} className="text-sm">
                <Link href={`/decisions#${d.id}`} className="font-medium link">
                  {d.title}
                </Link>{" "}
                <span className="text-xs text-gray-500">
                  · {formatDate(d.decidedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
