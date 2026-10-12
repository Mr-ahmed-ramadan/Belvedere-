import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { AnnouncementForm } from "../announcement-form";
import { createAnnouncementAction } from "../actions";

export default async function NewAnnouncementPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="New announcement" />
      <div className="card max-w-2xl">
        <AnnouncementForm action={createAnnouncementAction} />
      </div>
    </div>
  );
}
