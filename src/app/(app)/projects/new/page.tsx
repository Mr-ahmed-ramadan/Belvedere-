import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { type Role } from "@/lib/constants";
import { ProjectForm } from "../project-form";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });
  return (
    <div>
      <PageHeader title="New project" />
      <div className="card max-w-2xl">
        <ProjectForm
          action={createProjectAction}
          users={users.map((u) => ({ ...u, role: u.role as Role }))}
        />
      </div>
    </div>
  );
}
