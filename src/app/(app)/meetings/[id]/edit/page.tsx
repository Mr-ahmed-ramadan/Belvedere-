import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader, toDateTimeLocalValue } from "@/components/ui";
import {
  type MeetingKind,
  type MeetingStatus,
  type Visibility,
} from "@/lib/constants";
import { MeetingForm } from "../../meeting-form";
import { updateMeetingAction, deleteMeetingAction } from "../../actions";

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) notFound();

  return (
    <div>
      <PageHeader title="Edit meeting" />
      <div className="card max-w-2xl">
        <MeetingForm
          action={updateMeetingAction}
          defaults={{
            id: meeting.id,
            title: meeting.title,
            kind: meeting.kind as MeetingKind,
            scheduledAt: toDateTimeLocalValue(meeting.scheduledAt),
            location: meeting.location ?? "",
            agenda: meeting.agenda ?? "",
            status: meeting.status as MeetingStatus,
            visibility: meeting.visibility as Visibility,
          }}
        />
      </div>
      <form action={deleteMeetingAction} className="mt-4 max-w-2xl">
        <input type="hidden" name="id" value={meeting.id} />
        <button type="submit" className="btn btn-danger">
          Delete meeting
        </button>
      </form>
    </div>
  );
}
