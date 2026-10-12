"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createAndSendInvite } from "@/lib/invites";
import { ALL_ROLES } from "@/lib/constants";

export type ActionState = { error?: string; success?: string };

const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().toLowerCase().email("A valid email is required."),
  role: z.enum(ALL_ROLES as [string, ...string[]]),
  phone: z.string().trim().optional(),
  flatId: z.string().trim().optional(),
});

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    flatId: formData.get("flatId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, role, phone, flatId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with that email already exists." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      phone: phone || null,
      flatId: flatId || null,
      active: true,
    },
  });

  await createAndSendInvite(user.id);
  revalidatePath("/admin/users");
  return { success: `Invited ${name}. A set-password email has been sent.` };
}

export async function resendInviteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (userId) await createAndSendInvite(userId);
  revalidatePath("/admin/users");
}

export async function toggleActiveAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.id) return; // don't deactivate yourself
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });
  revalidatePath("/admin/users");
}

const updateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ALL_ROLES as [string, ...string[]]),
  flatId: z.string().optional(),
});

export async function updateUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    flatId: formData.get("flatId") || undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role, flatId: parsed.data.flatId || null },
  });
  revalidatePath("/admin/users");
  return { success: "Saved." };
}

const flatSchema = z.object({
  label: z.string().trim().min(1, "Flat label is required."),
  floor: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createFlatAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = flatSchema.safeParse({
    label: formData.get("label"),
    floor: formData.get("floor") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await prisma.flat.findUnique({
    where: { label: parsed.data.label },
  });
  if (existing) return { error: "A flat with that label already exists." };

  await prisma.flat.create({
    data: {
      label: parsed.data.label,
      floor: parsed.data.floor || null,
      notes: parsed.data.notes || null,
    },
  });
  revalidatePath("/admin/users");
  return { success: `Flat "${parsed.data.label}" added.` };
}
