"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { saveUploadedFile, deleteStoredFile } from "@/lib/storage";
import { VISIBILITY_TUPLE } from "../meetings/options";

export type ActionState = { error?: string; success?: string };

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const metaSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  category: z.string().trim().optional(),
  visibility: z.enum(VISIBILITY_TUPLE),
});

export async function uploadDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = metaSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category") || undefined,
    visibility: formData.get("visibility"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File is too large (max 10 MB)." };
  }

  const stored = await saveUploadedFile(file);

  await prisma.document.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category || null,
      visibility: parsed.data.visibility,
      filename: stored.filename,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
      size: stored.size,
      uploadedById: admin.id,
    },
  });

  revalidatePath("/documents");
  return { success: `Uploaded "${parsed.data.title}".` };
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;
  await prisma.document.delete({ where: { id } });
  await deleteStoredFile(doc.filename);
  revalidatePath("/documents");
}
