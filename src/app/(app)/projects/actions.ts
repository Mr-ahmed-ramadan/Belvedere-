"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import {
  PROJECT_STATUS_TUPLE,
  PROJECT_PRIORITY_TUPLE,
  VISIBILITY_TUPLE,
} from "./options";

export type ActionState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  status: z.enum(PROJECT_STATUS_TUPLE),
  priority: z.enum(PROJECT_PRIORITY_TUPLE),
  visibility: z.enum(VISIBILITY_TUPLE),
  assigneeId: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
});

function parseDueDate(value?: string): Date | null | undefined {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const due = parseDueDate(parsed.data.dueDate);
  if (due === undefined) return { error: "Invalid due date." };

  const project = await prisma.project.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      visibility: parsed.data.visibility,
      assigneeId: parsed.data.assigneeId || null,
      dueDate: due,
      createdById: admin.id,
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const due = parseDueDate(parsed.data.dueDate);
  if (due === undefined) return { error: "Invalid due date." };

  await prisma.project.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      visibility: parsed.data.visibility,
      assigneeId: parsed.data.assigneeId || null,
      dueDate: due,
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}

/** Admin, or the project's assignee, may post updates and toggle tasks. */
async function assertProjectAccess(projectId: string) {
  const user = await requireUser();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, assigneeId: true },
  });
  if (!project) throw new Error("Project not found");
  if (!isAdmin(user.role) && project.assigneeId !== user.id) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function addUpdateAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!projectId || !body) return;
  const user = await assertProjectAccess(projectId);
  await prisma.projectUpdate.create({
    data: { projectId, body, authorId: user.id },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function addTaskAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return;
  await assertProjectAccess(projectId);
  await prisma.projectTask.create({ data: { projectId, title } });
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTaskAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  if (!projectId || !taskId) return;
  await assertProjectAccess(projectId);
  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task) return;
  await prisma.projectTask.update({
    where: { id: taskId },
    data: { done: !task.done },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTaskAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  if (!projectId || !taskId) return;
  await assertProjectAccess(projectId);
  await prisma.projectTask.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
}
