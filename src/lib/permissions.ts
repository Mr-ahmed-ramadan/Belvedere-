import {
  ADMIN_ROLES,
  RESIDENT_ROLES,
  ROLES,
  VISIBILITY,
  type Role,
} from "./constants";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function isAdmin(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isResident(role: Role): boolean {
  return RESIDENT_ROLES.includes(role);
}

export function isHelper(role: Role): boolean {
  return role === ROLES.HELPER;
}

/**
 * Can a user with this role see an item with the given visibility?
 * Admins see everything; everyone else sees only PUBLIC items.
 * (Project-assignee access to internal projects is handled at the query level.)
 */
export function canSeeVisibility(role: Role, visibility: string): boolean {
  if (isAdmin(role)) return true;
  return visibility === VISIBILITY.PUBLIC;
}

/** Only admins (directors/secretary) can create/edit/delete building content. */
export function canManageContent(role: Role): boolean {
  return isAdmin(role);
}

/** Only admins can manage user accounts, flats and invites. */
export function canManageUsers(role: Role): boolean {
  return isAdmin(role);
}

/**
 * Permission matrix entry point used across server actions and pages.
 * Keeping all rules here makes them easy to audit and test.
 */
export type Action =
  | "manage:users"
  | "manage:flats"
  | "manage:announcements"
  | "manage:meetings"
  | "manage:decisions"
  | "manage:documents"
  | "manage:projects"
  | "view:internal";

export function can(role: Role, action: Action): boolean {
  switch (action) {
    case "manage:users":
    case "manage:flats":
    case "manage:announcements":
    case "manage:meetings":
    case "manage:decisions":
    case "manage:documents":
    case "manage:projects":
    case "view:internal":
      return isAdmin(role);
    default:
      return false;
  }
}
