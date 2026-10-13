"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { setSetting } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/constants";

export type ActionState = { error?: string; success?: string };

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//i.test(v), {
    message: "Links must start with http:// or https://",
  });

const emailOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
    message: "Enter a valid email address.",
  });

const schema = z.object({
  whatsappResidents: urlOrEmpty,
  whatsappBoard: urlOrEmpty,
  heroImage: urlOrEmpty,
  contactEmail: emailOrEmpty,
});

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    whatsappResidents: formData.get("whatsappResidents") ?? "",
    whatsappBoard: formData.get("whatsappBoard") ?? "",
    heroImage: formData.get("heroImage") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await Promise.all([
    setSetting(SETTING_KEYS.WHATSAPP_RESIDENTS, parsed.data.whatsappResidents),
    setSetting(SETTING_KEYS.WHATSAPP_BOARD, parsed.data.whatsappBoard),
    setSetting(SETTING_KEYS.HERO_IMAGE, parsed.data.heroImage),
    setSetting(SETTING_KEYS.CONTACT_EMAIL, parsed.data.contactEmail),
  ]);

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  revalidatePath("/login");
  return { success: "Settings saved." };
}
