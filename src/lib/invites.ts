import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { sendEmail } from "./email";

const INVITE_TTL_DAYS = 14;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function appUrl(): string {
  // APP_URL wins (e.g. a custom domain); otherwise use the URL Render injects
  // automatically (RENDER_EXTERNAL_URL); fall back to local dev.
  return (
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000"
  );
}

/**
 * Create (or refresh) an invite for a user and email them a set-password link.
 * Used when an admin adds someone, or re-sends an invitation.
 */
export async function createAndSendInvite(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  // Invalidate any previous unused invites for this user, then create a new one.
  await prisma.invite.deleteMany({ where: { userId, usedAt: null } });
  await prisma.invite.create({ data: { userId, token, expiresAt } });
  await prisma.user.update({
    where: { id: userId },
    data: { invitedAt: new Date() },
  });

  const link = `${appUrl()}/invite/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Your Belvedere account — set your password",
    text: [
      `Hello ${user.name},`,
      "",
      "An account has been created for you on the Belvedere building management system.",
      "Use the link below to set your password and sign in:",
      "",
      link,
      "",
      `This link expires in ${INVITE_TTL_DAYS} days.`,
      "",
      "If you were not expecting this, you can ignore this email.",
    ].join("\n"),
  });
}

export type InviteValidation =
  | { ok: true; userId: string; name: string; email: string }
  | { ok: false; reason: string };

/** Validate an invite token for the set-password page. */
export async function validateInvite(token: string): Promise<InviteValidation> {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!invite) return { ok: false, reason: "This invitation link is not valid." };
  if (invite.usedAt)
    return { ok: false, reason: "This invitation has already been used." };
  if (invite.expiresAt < new Date())
    return { ok: false, reason: "This invitation link has expired." };
  return {
    ok: true,
    userId: invite.userId,
    name: invite.user.name,
    email: invite.user.email,
  };
}

/** Consume an invite token and set the user's password. */
export async function acceptInvite(
  token: string,
  password: string,
): Promise<{ ok: boolean; reason?: string }> {
  const validation = await validateInvite(token);
  if (!validation.ok) return { ok: false, reason: validation.reason };
  if (password.length < 8)
    return { ok: false, reason: "Password must be at least 8 characters." };

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: validation.userId },
      data: { passwordHash, active: true },
    }),
    prisma.invite.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);
  return { ok: true };
}
