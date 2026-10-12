import { prisma } from "./db";
import { ADMIN_ROLES, RESIDENT_ROLES, AUDIENCE, type Audience } from "./constants";

/** Resolve the email recipients for an announcement audience. */
export async function recipientsForAudience(
  audience: Audience,
): Promise<string[]> {
  let roles: string[];
  if (audience === AUDIENCE.RESIDENTS) {
    roles = RESIDENT_ROLES;
  } else if (audience === AUDIENCE.BOARD) {
    roles = ADMIN_ROLES;
  } else {
    // ALL
    roles = []; // empty means "no role filter"
  }

  const users = await prisma.user.findMany({
    where: {
      active: true,
      ...(roles.length ? { role: { in: roles } } : {}),
    },
    select: { email: true },
  });
  return users.map((u) => u.email);
}
