import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  VISIBILITY,
  type ProjectStatus,
  type ProjectPriority,
} from "@/lib/constants";
import {
  PageHeader,
  Badge,
  VisibilityBadge,
  formatDate,
  formatDateTime,
} from "@/components/ui";
import {
  addUpdateAction,
  addTaskAction,
  toggleTaskAction,
  deleteTaskAction,
} from "../actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const admin = isAdmin(user.role);
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      assignee: { select: { name: true } },
      createdBy: { select: { name: true } },
      tasks: { orderBy: { createdAt: "asc" } },
      updates: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });
  if (!project) notFound();

  const isAssignee = project.assigneeId === user.id;
  const canView =
    admin || project.visibility === VISIBILITY.PUBLIC || isAssignee;
  if (!canView) notFound();

  const canEditWork = admin || isAssignee;
  const doneCount = project.tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title}
        action={
          admin ? (
            <Link href={`/projects/${project.id}/edit`} className="btn">
              Edit
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-blue-100 text-blue-800">
          {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
        </Badge>
        <Badge>
          Priority:{" "}
          {PROJECT_PRIORITY_LABELS[project.priority as ProjectPriority]}
        </Badge>
        {project.assignee ? (
          <Badge>Assigned: {project.assignee.name}</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-500">Unassigned</Badge>
        )}
        {project.dueDate ? (
          <Badge>Due {formatDate(project.dueDate)}</Badge>
        ) : null}
        {admin ? <VisibilityBadge visibility={project.visibility} /> : null}
      </div>

      {project.description ? (
        <section className="card">
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {project.description}
          </p>
        </section>
      ) : null}

      {/* Tasks */}
      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">
          Checklist ({doneCount}/{project.tasks.length})
        </h2>
        {project.tasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks yet.</p>
        ) : (
          <ul className="space-y-1">
            {project.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-sm">
                  {canEditWork ? (
                    <form action={toggleTaskAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="taskId" value={t.id} />
                      <button
                        type="submit"
                        className={`h-4 w-4 rounded border ${
                          t.done
                            ? "border-green-600 bg-green-600"
                            : "border-gray-400 bg-white"
                        }`}
                        aria-label={t.done ? "Mark not done" : "Mark done"}
                      />
                    </form>
                  ) : (
                    <span
                      className={`inline-block h-4 w-4 rounded border ${
                        t.done
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300"
                      }`}
                    />
                  )}
                  <span className={t.done ? "text-gray-400 line-through" : ""}>
                    {t.title}
                  </span>
                </span>
                {canEditWork ? (
                  <form action={deleteTaskAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="taskId" value={t.id} />
                    <button type="submit" className="link text-xs text-red-700">
                      Remove
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {canEditWork ? (
          <form action={addTaskAction} className="mt-3 flex gap-2">
            <input type="hidden" name="projectId" value={project.id} />
            <input
              name="title"
              placeholder="Add a task…"
              className="input"
              required
            />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        ) : null}
      </section>

      {/* Updates / activity log */}
      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Updates</h2>
        {canEditWork ? (
          <form action={addUpdateAction} className="mb-4 space-y-2">
            <input type="hidden" name="projectId" value={project.id} />
            <textarea
              name="body"
              rows={3}
              placeholder="Add an update…"
              required
              className="input"
            />
            <button type="submit" className="btn btn-primary">
              Post update
            </button>
          </form>
        ) : null}

        {project.updates.length === 0 ? (
          <p className="text-sm text-gray-500">No updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {project.updates.map((u) => (
              <li key={u.id} className="border-l-2 border-gray-200 pl-3">
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {u.body}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {u.author.name} · {formatDateTime(u.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-gray-400">
        Created by {project.createdBy.name} · {formatDate(project.createdAt)}
      </p>
    </div>
  );
}
