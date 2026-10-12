import { prisma } from "./db";

/** Read many settings at once; returns a map (missing keys omitted). */
export async function getSettings(
  keys: string[],
): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/** Upsert a setting; an empty/blank value deletes it. */
export async function setSetting(key: string, value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await prisma.setting.deleteMany({ where: { key } });
    return;
  }
  await prisma.setting.upsert({
    where: { key },
    update: { value: trimmed },
    create: { key, value: trimmed },
  });
}
