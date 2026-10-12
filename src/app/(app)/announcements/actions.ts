"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { recipientsForAudience } from "@/lib/recipients";
import { sendBulkEmail } from "@/lib/email";
import type { Audience } from "@/lib/constants";
import { ALL_AUDIENCES_TUPLE } from "./options";

export type ActionState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Body is required."),
  audience: z.enum(ALL_AUDIENCES_TUPLE),
});

async function notify(audience: Audience, title: string, body: string) {
  const recipients = await recipientsForAudience(audience);
  await sendBulkEmail(
    recipients,
    `[Belvedere] ${title}`,
    `${body}\n\n— Belvedere building management`,
  );
}

export async function createAnnouncementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const publish = formData.get("publish") === "1";
  const { title, body, audience } = parsed.data;

  await prisma.announcement.create({
    data: {
      title,
      body,
      audience,
      authorId: admin.id,
      publishedAt: publish ? new Date() : null,
    },
  });

  if (publish) await notify(audience, title, body);

  revalidatePath("/announcements");
  redirect("/announcements");
}

export async function updateAnnouncementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) return { error: "Announcement not found." };

  const publish = formData.get("publish") === "1";
  const wasPublished = Boolean(existing.publishedAt);
  const { title, body, audience } = parsed.data;

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      body,
      audience,
      publishedAt:
        publish && !wasPublished ? new Date() : existing.publishedAt,
    },
  });

  // Only email if this action published a previously-unpublished announcement.
  if (publish && !wasPublished) await notify(audience, title, body);

  revalidatePath("/announcements");
  redirect("/announcements");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.announcement.delete({ where: { id } });
  revalidatePath("/announcements");
  redirect("/announcements");
}
