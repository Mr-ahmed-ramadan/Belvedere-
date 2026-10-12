"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  VISIBILITY_LABELS,
  type Visibility,
} from "@/lib/constants";
import { VISIBILITY_TUPLE } from "../meetings/options";
import type { ActionState } from "./actions";

const initial: ActionState = {};

type MeetingOption = { id: string; title: string };

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  meetings: MeetingOption[];
  defaults?: {
    id?: string;
    title?: string;
    detail?: string;
    decidedAt?: string;
    visibility?: Visibility;
    meetingId?: string;
  };
};

export function DecisionForm({ action, meetings, defaults }: Props) {
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
          Decision
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
        <label className="label" htmlFor="detail">
          Detail
        </label>
        <textarea
          id="detail"
          name="detail"
          rows={5}
          required
          defaultValue={defaults?.detail}
          className="input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="decidedAt">
            Date decided
          </label>
          <input
            id="decidedAt"
            name="decidedAt"
            type="date"
            required
            defaultValue={defaults?.decidedAt}
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
            defaultValue={defaults?.visibility ?? "PUBLIC"}
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
      <div>
        <label className="label" htmlFor="meetingId">
          Linked meeting (optional)
        </label>
        <select
          id="meetingId"
          name="meetingId"
          defaultValue={defaults?.meetingId ?? ""}
          className="input"
        >
          <option value="">— none —</option>
          {meetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save decision"}
        </button>
        <Link href="/decisions" className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}
