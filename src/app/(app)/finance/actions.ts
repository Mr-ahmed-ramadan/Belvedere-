"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { parseMoney } from "@/lib/money";
import { VISIBILITY_TUPLE } from "../meetings/options";

export type ActionState = { error?: string };

// ---------------------------------------------------------------------------
// Reserve fund
// ---------------------------------------------------------------------------

const reserveSchema = z.object({
  date: z.string().min(1, "Date is required."),
  description: z.string().trim().min(1, "Description is required."),
  amount: z.string().min(1, "Amount is required."),
});

export async function addReserveEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = reserveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const amount = parseMoney(parsed.data.amount);
  if (amount === null)
    return { error: "Amount must be a number (use a minus sign for spending)." };
  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) return { error: "Invalid date." };

  await prisma.reserveFundEntry.create({
    data: {
      date,
      description: parsed.data.description,
      amount,
      createdById: admin.id,
    },
  });
  revalidatePath("/finance/reserve");
  revalidatePath("/finance");
  return {};
}

export async function deleteReserveEntryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.reserveFundEntry.delete({ where: { id } });
  revalidatePath("/finance/reserve");
  revalidatePath("/finance");
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

const budgetSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  title: z.string().trim().optional(),
  note: z.string().trim().optional(),
  visibility: z.enum(VISIBILITY_TUPLE),
});

export async function createBudgetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const budget = await prisma.budget.create({
    data: {
      year: parsed.data.year,
      title: parsed.data.title || null,
      note: parsed.data.note || null,
      visibility: parsed.data.visibility,
      createdById: admin.id,
    },
  });
  revalidatePath("/finance");
  redirect(`/finance/budgets/${budget.id}`);
}

export async function deleteBudgetAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.budget.delete({ where: { id } });
  revalidatePath("/finance");
  redirect("/finance");
}

const lineSchema = z.object({
  budgetId: z.string().min(1),
  category: z.string().trim().min(1, "Category is required."),
  budgeted: z.string().optional(),
  actual: z.string().optional(),
});

export async function addBudgetLineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = lineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const budgeted = parsed.data.budgeted ? parseMoney(parsed.data.budgeted) : 0;
  const actual = parsed.data.actual ? parseMoney(parsed.data.actual) : 0;
  if (budgeted === null || actual === null)
    return { error: "Budgeted and actual must be numbers." };

  const count = await prisma.budgetLine.count({
    where: { budgetId: parsed.data.budgetId },
  });
  await prisma.budgetLine.create({
    data: {
      budgetId: parsed.data.budgetId,
      category: parsed.data.category,
      budgeted,
      actual,
      order: count + 1,
    },
  });
  revalidatePath(`/finance/budgets/${parsed.data.budgetId}`);
  return {};
}

export async function updateBudgetLineAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const budgetId = String(formData.get("budgetId") ?? "");
  if (!id) return;
  const budgeted = parseMoney(String(formData.get("budgeted") ?? "0")) ?? 0;
  const actual = parseMoney(String(formData.get("actual") ?? "0")) ?? 0;
  const category = String(formData.get("category") ?? "").trim();
  await prisma.budgetLine.update({
    where: { id },
    data: { budgeted, actual, ...(category ? { category } : {}) },
  });
  revalidatePath(`/finance/budgets/${budgetId}`);
}

export async function deleteBudgetLineAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const budgetId = String(formData.get("budgetId") ?? "");
  if (id) await prisma.budgetLine.delete({ where: { id } });
  revalidatePath(`/finance/budgets/${budgetId}`);
}
