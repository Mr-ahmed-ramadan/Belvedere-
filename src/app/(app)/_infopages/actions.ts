"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { SECTION } from "@/lib/constants";
import { VISIBILITY_TUPLE } from "../meetings/options";

export type ActionState = { error?: string };

const SECTION_TUPLE = [SECTION.WELCOME, SECTION.FINANCE] as const;

const schema = z.object({
  section: z.enum(SECTION_TUPLE),
  category: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Content is required."),
  visibility: z.enum(VISIBILITY_TUPLE),
  order: z.coerce.number().int().optional(),
  documentId: z.string().trim().optional(),
  returnTo: z.string().trim().optional(),
});

function safeReturn(returnTo?: string): string {
  // Only allow internal paths.
  if (returnTo && returnTo.startsWith("/")) return returnTo;
  return "/welcome";
}

export async function createInfoPageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.infoPage.create({
    data: {
      section: parsed.data.section,
      category: parsed.data.category || null,
      title: parsed.data.title,
      body: parsed.data.body,
      visibility: parsed.data.visibility,
      order: parsed.data.order ?? 0,
      documentId: parsed.data.documentId || null,
      createdById: admin.id,
    },
  });
  const to = safeReturn(parsed.data.returnTo);
  revalidatePath(to);
  redirect(to);
}

export async function updateInfoPageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.infoPage.update({
    where: { id },
    data: {
      category: parsed.data.category || null,
      title: parsed.data.title,
      body: parsed.data.body,
      visibility: parsed.data.visibility,
      order: parsed.data.order ?? 0,
      documentId: parsed.data.documentId || null,
    },
  });
  const to = safeReturn(parsed.data.returnTo);
  revalidatePath(to);
  redirect(to);
}

export async function deleteInfoPageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const to = safeReturn(String(formData.get("returnTo") ?? ""));
  if (id) await prisma.infoPage.delete({ where: { id } });
  revalidatePath(to);
  redirect(to);
}
