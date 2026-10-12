import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { type Audience } from "@/lib/constants";
import { AnnouncementForm } from "../../announcement-form";
import {
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from "../../actions";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div>
      <PageHeader title="Edit announcement" />
      <div className="card max-w-2xl">
        <AnnouncementForm
          action={updateAnnouncementAction}
          defaults={{
            id: announcement.id,
            title: announcement.title,
            body: announcement.body,
            audience: announcement.audience as Audience,
            published: Boolean(announcement.publishedAt),
          }}
        />
      </div>

      <form action={deleteAnnouncementAction} className="mt-4 max-w-2xl">
        <input type="hidden" name="id" value={announcement.id} />
        <button type="submit" className="btn btn-danger">
          Delete announcement
        </button>
      </form>
    </div>
  );
}
