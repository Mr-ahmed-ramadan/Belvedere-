import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { projectFilter } from "@/lib/visibility";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  type ProjectStatus,
  type ProjectPriority,
} from "@/lib/constants";
import { PROJECT_STATUS_TUPLE } from "./options";
import {
  PageHeader,
  EmptyState,
  LinkButton,
  Badge,
  VisibilityBadge,
  formatDate,
} from "@/components/ui";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MED: "bg-amber-100 text-amber-800",
  LOW: "bg-gray-100 text-gray-600",
};

export default async function ProjectsPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const projects = await prisma.project.findMany({
    where: projectFilter(user.role, user.id),
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      assignee: { select: { name: true } },
      _count: { select: { tasks: true, updates: true } },
    },
  });

  const byStatus = (status: string) =>
    projects.filter((p) => p.status === status);

  return (
    <div>
      <PageHeader
        title="Projects & cases"
        description="Track ongoing work and cases the board is handling."
        action={
          admin ? (
            <LinkButton href="/projects/new" variant="primary">
              New project
            </LinkButton>
          ) : null
        }
      />

      {projects.length === 0 ? (
        <EmptyState>No projects yet.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PROJECT_STATUS_TUPLE.map((status) => {
            const items = byStatus(status);
            return (
              <div key={status}>
                <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                  {PROJECT_STATUS_LABELS[status as ProjectStatus]} (
                  {items.length})
                </h2>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    items.map((p) => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.id}`}
                        className="card block hover:border-blue-400"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{p.title}</span>
                          <Badge className={PRIORITY_STYLES[p.priority] ?? ""}>
                            {PROJECT_PRIORITY_LABELS[p.priority as ProjectPriority]}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {p.assignee ? (
                            <span>{p.assignee.name}</span>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                          {p.dueDate ? (
                            <span>· due {formatDate(p.dueDate)}</span>
                          ) : null}
                          {p._count.tasks > 0 ? (
                            <span>· {p._count.tasks} task(s)</span>
                          ) : null}
                          {admin ? <VisibilityBadge visibility={p.visibility} /> : null}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
