// Central place for the string "enums" stored in SQLite.

export const ROLES = {
  DIRECTOR: "DIRECTOR",
  SECRETARY: "SECRETARY",
  LANDLORD: "LANDLORD",
  RENTER: "RENTER",
  HELPER: "HELPER",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ALL_ROLES = Object.values(ROLES) as Role[];

export const ROLE_LABELS: Record<Role, string> = {
  DIRECTOR: "Director",
  SECRETARY: "Secretary",
  LANDLORD: "Landlord",
  RENTER: "Renter",
  HELPER: "Maintenance / Helper",
};

// Directors and the secretary are administrators by definition.
export const ADMIN_ROLES: Role[] = [ROLES.DIRECTOR, ROLES.SECRETARY];
export const RESIDENT_ROLES: Role[] = [ROLES.LANDLORD, ROLES.RENTER];

export const AUDIENCE = {
  ALL: "ALL",
  RESIDENTS: "RESIDENTS",
  BOARD: "BOARD",
} as const;
export type Audience = (typeof AUDIENCE)[keyof typeof AUDIENCE];
export const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL: "Everyone",
  RESIDENTS: "Residents only",
  BOARD: "Board & secretary only",
};

export const VISIBILITY = {
  PUBLIC: "PUBLIC",
  INTERNAL: "INTERNAL",
} as const;
export type Visibility = (typeof VISIBILITY)[keyof typeof VISIBILITY];
export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: "Public (residents can see)",
  INTERNAL: "Internal (board & secretary only)",
};

export const MEETING_KIND = {
  BOARD: "BOARD",
  AGM: "AGM",
  EGM: "EGM",
} as const;
export type MeetingKind = (typeof MEETING_KIND)[keyof typeof MEETING_KIND];
export const MEETING_KIND_LABELS: Record<MeetingKind, string> = {
  BOARD: "Board meeting",
  AGM: "Annual General Meeting",
  EGM: "Extraordinary General Meeting",
};

export const MEETING_STATUS = {
  SCHEDULED: "SCHEDULED",
  HELD: "HELD",
  CANCELLED: "CANCELLED",
} as const;
export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];
export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: "Scheduled",
  HELD: "Held",
  CANCELLED: "Cancelled",
};

export const PROJECT_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  DONE: "DONE",
} as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  ON_HOLD: "On hold",
  DONE: "Done",
};

export const PROJECT_PRIORITY = {
  LOW: "LOW",
  MED: "MED",
  HIGH: "HIGH",
} as const;
export type ProjectPriority =
  (typeof PROJECT_PRIORITY)[keyof typeof PROJECT_PRIORITY];
export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  LOW: "Low",
  MED: "Medium",
  HIGH: "High",
};

// Static info-page sections.
export const SECTION = {
  WELCOME: "WELCOME",
  FINANCE: "FINANCE",
} as const;
export type Section = (typeof SECTION)[keyof typeof SECTION];

// Suggested categories (free text is also allowed on the forms).
export const WELCOME_CATEGORIES = [
  "Facilities",
  "Rules",
  "Access & keys",
  "Moving in",
  "Refuse & recycling",
  "Parking",
  "Emergencies & contacts",
  "General",
];

export const FINANCE_CATEGORIES = [
  "Financial statements",
  "Strategy",
  "Service charge",
  "General",
];
