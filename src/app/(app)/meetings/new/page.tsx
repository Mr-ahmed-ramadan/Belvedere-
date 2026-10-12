import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { MeetingForm } from "../meeting-form";
import { createMeetingAction } from "../actions";

export default async function NewMeetingPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="New meeting" />
      <div className="card max-w-2xl">
        <MeetingForm action={createMeetingAction} />
      </div>
    </div>
  );
}
