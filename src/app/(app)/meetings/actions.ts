"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import {
  MEETING_KIND_TUPLE,
  MEETING_STATUS_TUPLE,
  VISIBILITY_TUPLE,
} from "./options";

export type ActionState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  kind: z.enum(MEETING_KIND_TUPLE),
  scheduledAt: z.string().min(1, "Date and time are required."),
  location: z.string().trim().optional(),
  agenda: z.string().trim().optional(),
  status: z.enum(MEETING_STATUS_TUPLE),
  visibility: z.enum(VISIBILITY_TUPLE),
});

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const when = parseDate(parsed.data.scheduledAt);
  if (!when) return { error: "Invalid date/time." };

  const meeting = await prisma.meeting.create({
    data: {
      title: parsed.data.title,
      kind: parsed.data.kind,
      scheduledAt: when,
      location: parsed.data.location || null,
      agenda: parsed.data.agenda || null,
      status: parsed.data.status,
      visibility: parsed.data.visibility,
      createdById: admin.id,
    },
  });
  revalidatePath("/meetings");
  redirect(`/meetings/${meeting.id}`);
}

export async function updateMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const when = parseDate(parsed.data.scheduledAt);
  if (!when) return { error: "Invalid date/time." };

  await prisma.meeting.update({
    where: { id },
    data: {
      title: parsed.data.title,
      kind: parsed.data.kind,
      scheduledAt: when,
      location: parsed.data.location || null,
      agenda: parsed.data.agenda || null,
      status: parsed.data.status,
      visibility: parsed.data.visibility,
    },
  });
  revalidatePath("/meetings");
  redirect(`/meetings/${id}`);
}

export async function deleteMeetingAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.meeting.delete({ where: { id } });
  revalidatePath("/meetings");
  redirect("/meetings");
}

export async function saveMinutesAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const minutes = String(formData.get("minutes") ?? "");
  const markHeld = formData.get("markHeld") === "1";
  if (!id) return;
  await prisma.meeting.update({
    where: { id },
    data: {
      minutes: minutes || null,
      ...(markHeld ? { status: "HELD" } : {}),
    },
  });
  revalidatePath(`/meetings/${id}`);
}

export async function addAttendeeAction(formData: FormData) {
  await requireAdmin();
  const meetingId = String(formData.get("meetingId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!meetingId || !userId) return;
  await prisma.meetingAttendee.upsert({
    where: { meetingId_userId: { meetingId, userId } },
    update: {},
    create: { meetingId, userId, present: true },
  });
  revalidatePath(`/meetings/${meetingId}`);
}

export async function toggleAttendeeAction(formData: FormData) {
  await requireAdmin();
  const meetingId = String(formData.get("meetingId") ?? "");
  const attendeeId = String(formData.get("attendeeId") ?? "");
  if (!attendeeId) return;
  const attendee = await prisma.meetingAttendee.findUnique({
    where: { id: attendeeId },
  });
  if (!attendee) return;
  await prisma.meetingAttendee.update({
    where: { id: attendeeId },
    data: { present: !attendee.present },
  });
  revalidatePath(`/meetings/${meetingId}`);
}

export async function removeAttendeeAction(formData: FormData) {
  await requireAdmin();
  const meetingId = String(formData.get("meetingId") ?? "");
  const attendeeId = String(formData.get("attendeeId") ?? "");
  if (!attendeeId) return;
  await prisma.meetingAttendee.delete({ where: { id: attendeeId } });
  revalidatePath(`/meetings/${meetingId}`);
}
