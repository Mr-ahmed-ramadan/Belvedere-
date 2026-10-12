import type { Prisma } from "@prisma/client";
import { isAdmin, isResident } from "./permissions";
import { AUDIENCE, VISIBILITY, type Role } from "./constants";

/**
 * Prisma `where` filter for announcements visible to a role.
 * Admins see everything (incl. drafts); others see published items whose
 * audience includes them.
 */
export function announcementFilter(role: Role): Prisma.AnnouncementWhereInput {
  if (isAdmin(role)) return {};
  const audiences = isResident(role)
    ? [AUDIENCE.ALL, AUDIENCE.RESIDENTS]
    : [AUDIENCE.ALL];
  return { publishedAt: { not: null }, audience: { in: audiences } };
}

/** Generic PUBLIC/INTERNAL filter: admins see all, others see PUBLIC only. */
export function visibilityFilter(role: Role): { visibility?: string } {
  if (isAdmin(role)) return {};
  return { visibility: VISIBILITY.PUBLIC };
}
