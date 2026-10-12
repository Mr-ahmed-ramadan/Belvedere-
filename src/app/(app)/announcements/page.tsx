import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { announcementFilter } from "@/lib/visibility";
import { AUDIENCE_LABELS, type Audience } from "@/lib/constants";
import {
  PageHeader,
  EmptyState,
  LinkButton,
  Badge,
  formatDateTime,
} from "@/components/ui";

export default async function AnnouncementsPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const announcements = await prisma.announcement.findMany({
    where: announcementFilter(user.role),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Updates and notices for the building."
        action={
          admin ? (
            <LinkButton href="/announcements/new" variant="primary">
              New announcement
            </LinkButton>
          ) : null
        }
      />

      {announcements.length === 0 ? (
        <EmptyState>No announcements yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{a.title}</h2>
                  <p className="text-xs text-gray-500">
                    {a.publishedAt
                      ? `Published ${formatDateTime(a.publishedAt)}`
                      : "Draft"}{" "}
                    · by {a.author.name}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!a.publishedAt ? (
                    <Badge className="bg-amber-100 text-amber-800">Draft</Badge>
                  ) : null}
                  {admin ? (
                    <Badge>{AUDIENCE_LABELS[a.audience as Audience]}</Badge>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                {a.body}
              </p>
              {admin ? (
                <div className="mt-3">
                  <Link
                    href={`/announcements/${a.id}/edit`}
                    className="link text-sm"
                  >
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
