import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import {
  type Role,
  type ProjectStatus,
  type ProjectPriority,
  type Visibility,
} from "@/lib/constants";
import { ProjectForm } from "../../project-form";
import { updateProjectAction, deleteProjectAction } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [project, users] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);
  if (!project) notFound();

  return (
    <div>
      <PageHeader title="Edit project" />
      <div className="card max-w-2xl">
        <ProjectForm
          action={updateProjectAction}
          users={users.map((u) => ({ ...u, role: u.role as Role }))}
          defaults={{
            id: project.id,
            title: project.title,
            description: project.description ?? "",
            status: project.status as ProjectStatus,
            priority: project.priority as ProjectPriority,
            visibility: project.visibility as Visibility,
            assigneeId: project.assigneeId ?? "",
            dueDate: project.dueDate
              ? project.dueDate.toISOString().slice(0, 10)
              : "",
          }}
        />
      </div>
      <form action={deleteProjectAction} className="mt-4 max-w-2xl">
        <input type="hidden" name="id" value={project.id} />
        <button type="submit" className="btn btn-danger">
          Delete project
        </button>
      </form>
    </div>
  );
}
