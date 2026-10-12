"use client";

import { useActionState } from "react";
import {
  createUserAction,
  createFlatAction,
  type ActionState,
} from "./actions";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/constants";

const initial: ActionState = {};

type Flat = { id: string; label: string };

export function AddUserForm({ flats }: { flats: Flat[] }) {
  const [state, action, pending] = useActionState(createUserAction, initial);

  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="role">
            Role
          </label>
          <select id="role" name="role" className="input" defaultValue="RENTER">
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="flatId">
            Flat (optional)
          </label>
          <select id="flatId" name="flatId" className="input" defaultValue="">
            <option value="">— none —</option>
            {flats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="phone">
            Phone (optional)
          </label>
          <input id="phone" name="phone" className="input" />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Inviting…" : "Add person & send invite"}
      </button>
    </form>
  );
}

export function AddFlatForm() {
  const [state, action, pending] = useActionState(createFlatAction, initial);

  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="label">
            Flat label
          </label>
          <input
            id="label"
            name="label"
            placeholder="Flat 3"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="floor">
            Floor (optional)
          </label>
          <input id="floor" name="floor" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes (optional)
          </label>
          <input id="notes" name="notes" className="input" />
        </div>
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Adding…" : "Add flat"}
      </button>
    </form>
  );
}
