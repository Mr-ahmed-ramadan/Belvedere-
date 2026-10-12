"use server";

import { acceptInvite } from "@/lib/invites";

export type AcceptState = { error?: string; success?: boolean };

export async function acceptInviteAction(
  _prevState: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const result = await acceptInvite(token, password);
  if (!result.ok) return { error: result.reason ?? "Could not set password." };
  return { success: true };
}
