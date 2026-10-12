import { describe, it, expect } from "vitest";
import {
  isAdmin,
  isResident,
  isHelper,
  canSeeVisibility,
  can,
} from "./permissions";
import { announcementFilter, visibilityFilter, projectFilter } from "./visibility";
import { ROLES } from "./constants";

describe("role predicates", () => {
  it("treats directors and secretary as admins", () => {
    expect(isAdmin(ROLES.DIRECTOR)).toBe(true);
    expect(isAdmin(ROLES.SECRETARY)).toBe(true);
    expect(isAdmin(ROLES.LANDLORD)).toBe(false);
    expect(isAdmin(ROLES.RENTER)).toBe(false);
    expect(isAdmin(ROLES.HELPER)).toBe(false);
  });

  it("identifies residents and helpers", () => {
    expect(isResident(ROLES.LANDLORD)).toBe(true);
    expect(isResident(ROLES.RENTER)).toBe(true);
    expect(isResident(ROLES.HELPER)).toBe(false);
    expect(isHelper(ROLES.HELPER)).toBe(true);
  });
});

describe("visibility access", () => {
  it("lets admins see internal items", () => {
    expect(canSeeVisibility(ROLES.DIRECTOR, "INTERNAL")).toBe(true);
    expect(canSeeVisibility(ROLES.SECRETARY, "INTERNAL")).toBe(true);
  });

  it("restricts residents and helpers to public items", () => {
    for (const role of [ROLES.LANDLORD, ROLES.RENTER, ROLES.HELPER]) {
      expect(canSeeVisibility(role, "PUBLIC")).toBe(true);
      expect(canSeeVisibility(role, "INTERNAL")).toBe(false);
    }
  });
});

describe("can()", () => {
  it("only admins may manage content and users", () => {
    expect(can(ROLES.DIRECTOR, "manage:users")).toBe(true);
    expect(can(ROLES.SECRETARY, "manage:announcements")).toBe(true);
    expect(can(ROLES.LANDLORD, "manage:announcements")).toBe(false);
    expect(can(ROLES.HELPER, "manage:projects")).toBe(false);
    expect(can(ROLES.RENTER, "view:internal")).toBe(false);
  });
});

describe("query filters", () => {
  it("announcementFilter is unrestricted for admins", () => {
    expect(announcementFilter(ROLES.DIRECTOR)).toEqual({});
  });

  it("announcementFilter limits residents to published ALL/RESIDENTS", () => {
    const filter = announcementFilter(ROLES.RENTER);
    expect(filter.publishedAt).toEqual({ not: null });
    expect(filter.audience).toEqual({ in: ["ALL", "RESIDENTS"] });
  });

  it("announcementFilter limits helpers to published ALL only", () => {
    const filter = announcementFilter(ROLES.HELPER);
    expect(filter.audience).toEqual({ in: ["ALL"] });
  });

  it("visibilityFilter hides internal items from non-admins", () => {
    expect(visibilityFilter(ROLES.DIRECTOR)).toEqual({});
    expect(visibilityFilter(ROLES.LANDLORD)).toEqual({ visibility: "PUBLIC" });
  });

  it("projectFilter lets non-admins see public or assigned projects", () => {
    expect(projectFilter(ROLES.DIRECTOR, "u1")).toEqual({});
    expect(projectFilter(ROLES.HELPER, "u1")).toEqual({
      OR: [{ visibility: "PUBLIC" }, { assigneeId: "u1" }],
    });
  });
});
