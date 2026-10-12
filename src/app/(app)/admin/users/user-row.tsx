"use client";

import { useActionState } from "react";
import {
  updateUserAction,
  resendInviteAction,
  toggleActiveAction,
  type ActionState,
} from "./actions";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/constants";

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
  };
  flats: Flat[];
  isSelf: boolean;
};

const initial: ActionState = {};

export function UserRow({ user, flats, isSelf }: UserRowProps) {
  const [state, action, pending] = useActionState(updateUserAction, initial);

  return (
    <tr className="border-t border-gray-200 align-top">
      <td className="px-3 py-2">
        <div className="font-medium">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
        <div className="mt-1 flex gap-1">
          {!user.active ? (
            <span className="badge bg-gray-200 text-gray-700">Inactive</span>
          ) : null}
          {!user.hasPassword ? (
            <span className="badge bg-amber-100 text-amber-800">
              Invite pending
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-2">
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
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
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
          {state.success ? (
            <span className="text-xs text-green-700">{state.success}</span>
          ) : null}
          {state.error ? (
            <span className="text-xs text-red-700">{state.error}</span>
          ) : null}
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
