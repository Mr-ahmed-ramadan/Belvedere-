"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  VISIBILITY_LABELS,
  ROLE_LABELS,
  type ProjectStatus,
  type ProjectPriority,
  type Visibility,
  type Role,
} from "@/lib/constants";
import {
  PROJECT_STATUS_TUPLE,
  PROJECT_PRIORITY_TUPLE,
  VISIBILITY_TUPLE,
} from "./options";
import type { ActionState } from "./actions";

const initial: ActionState = {};

type UserOption = { id: string; name: string; role: Role };

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  users: UserOption[];
  defaults?: {
    id?: string;
    title?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    visibility?: Visibility;
    assigneeId?: string;
    dueDate?: string;
  };
};

export function ProjectForm({ action, users, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description}
          className="input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "OPEN"}
            className="input"
          >
            {PROJECT_STATUS_TUPLE.map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={defaults?.priority ?? "MED"}
            className="input"
          >
            {PROJECT_PRIORITY_TUPLE.map((p) => (
              <option key={p} value={p}>
                {PROJECT_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="assigneeId">
            Assigned to (optional)
          </label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={defaults?.assigneeId ?? ""}
            className="input"
          >
            <option value="">— unassigned —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({ROLE_LABELS[u.role]})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dueDate">
            Due date (optional)
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaults?.dueDate}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="visibility">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={defaults?.visibility ?? "INTERNAL"}
            className="input"
          >
            {VISIBILITY_TUPLE.map((v) => (
              <option key={v} value={v}>
                {VISIBILITY_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save project"}
        </button>
        <Link href="/projects" className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}
