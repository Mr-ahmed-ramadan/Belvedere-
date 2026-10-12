"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { VISIBILITY_TUPLE } from "../meetings/options";

export type ActionState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  detail: z.string().trim().min(1, "Detail is required."),
  decidedAt: z.string().min(1, "Date is required."),
  visibility: z.enum(VISIBILITY_TUPLE),
  meetingId: z.string().trim().optional(),
});

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createDecisionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const when = parseDate(parsed.data.decidedAt);
  if (!when) return { error: "Invalid date." };

  await prisma.decision.create({
    data: {
      title: parsed.data.title,
      detail: parsed.data.detail,
      decidedAt: when,
      visibility: parsed.data.visibility,
      meetingId: parsed.data.meetingId || null,
      createdById: admin.id,
    },
  });
  revalidatePath("/decisions");
  redirect("/decisions");
}

export async function updateDecisionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const when = parseDate(parsed.data.decidedAt);
  if (!when) return { error: "Invalid date." };

  await prisma.decision.update({
    where: { id },
    data: {
      title: parsed.data.title,
      detail: parsed.data.detail,
      decidedAt: when,
      visibility: parsed.data.visibility,
      meetingId: parsed.data.meetingId || null,
    },
  });
  revalidatePath("/decisions");
  redirect("/decisions");
}

export async function deleteDecisionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.decision.delete({ where: { id } });
  revalidatePath("/decisions");
  redirect("/decisions");
}
