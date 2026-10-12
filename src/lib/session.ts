import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "./permissions";
import type { Role } from "./constants";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** Returns the signed-in user or null (no redirect). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role,
  };
}

/** Require a signed-in user; redirect to /login otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an admin (director/secretary); redirect otherwise. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/dashboard");
  return user;
}
