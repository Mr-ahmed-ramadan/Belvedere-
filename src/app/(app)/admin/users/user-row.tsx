"use client";

import { useActionState } from "react";
import {
  updateUserAction,
  resendInviteAction,
  toggleActiveAction,
  type ActionState,
} from "./actions";
import {
  ALL_ROLES,
  ROLE_LABELS,
  ALL_CONTACT_METHODS,
  CONTACT_METHOD_LABELS,
  NON_DIGITAL_CONTACT,
  type Role,
  type ContactMethod,
} from "@/lib/constants";

type Flat = { id: string; label: string };

type UserRowProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    flatId: string | null;
    active: boolean;
    hasPassword: boolean;
    preferredContact: ContactMethod;
    phone: string | null;
    commsNotes: string | null;
  };
  flats: Flat[];
  isSelf: boolean;
};

const initial: ActionState = {};

export function UserRow({ user, flats, isSelf }: UserRowProps) {
  const [state, action, pending] = useActionState(updateUserAction, initial);
  const nonDigital = NON_DIGITAL_CONTACT.includes(user.preferredContact);

  return (
    <tr className="border-t border-gray-200 align-top">
      <td className="px-3 py-2">
        <div className="font-medium">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
        {user.phone ? (
          <div className="text-xs text-gray-500">{user.phone}</div>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-1">
          <span
            className={`badge ${
              nonDigital
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-600"
            }`}
            title="Preferred contact method"
          >
            {CONTACT_METHOD_LABELS[user.preferredContact]}
          </span>
          {!user.active ? (
            <span className="badge bg-gray-200 text-gray-700">Inactive</span>
          ) : null}
          {!user.hasPassword ? (
            <span className="badge bg-amber-100 text-amber-800">
              Invite pending
            </span>
          ) : null}
        </div>
        {user.commsNotes ? (
          <div className="mt-1 text-xs italic text-gray-600">
            {user.commsNotes}
          </div>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <form action={action} className="space-y-2">
          <input type="hidden" name="userId" value={user.id} />
          <div className="flex flex-wrap items-center gap-2">
            <select name="role" defaultValue={user.role} className="input w-auto">
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <select
              name="flatId"
              defaultValue={user.flatId ?? ""}
              className="input w-auto"
            >
              <option value="">— no flat —</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              name="preferredContact"
              defaultValue={user.preferredContact}
              className="input w-auto"
              title="Preferred contact method"
            >
              {ALL_CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {CONTACT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              placeholder="Phone"
              className="input w-40"
            />
            <input
              name="commsNotes"
              defaultValue={user.commsNotes ?? ""}
              placeholder="Comms notes"
              className="input grow"
            />
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            {state.success ? (
              <span className="text-xs text-green-700">{state.success}</span>
            ) : null}
            {state.error ? (
              <span className="text-xs text-red-700">{state.error}</span>
            ) : null}
          </div>
        </form>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <form action={resendInviteAction}>
            <input type="hidden" name="userId" value={user.id} />
            <button type="submit" className="btn">
              {user.hasPassword ? "Reset password" : "Resend invite"}
            </button>
          </form>
          {!isSelf ? (
            <form action={toggleActiveAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className={`btn ${user.active ? "btn-danger" : ""}`}
              >
                {user.active ? "Deactivate" : "Activate"}
              </button>
            </form>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
