"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  MEETING_KIND_LABELS,
  MEETING_STATUS_LABELS,
  VISIBILITY_LABELS,
  type MeetingKind,
  type MeetingStatus,
  type Visibility,
} from "@/lib/constants";
import {
  MEETING_KIND_TUPLE,
  MEETING_STATUS_TUPLE,
  VISIBILITY_TUPLE,
} from "./options";
import type { ActionState } from "./actions";

const initial: ActionState = {};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: {
    id?: string;
    title?: string;
    kind?: MeetingKind;
    scheduledAt?: string;
    location?: string;
    agenda?: string;
    status?: MeetingStatus;
    visibility?: Visibility;
  };
};

export function MeetingForm({ action, defaults }: Props) {
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="kind">
            Type
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={defaults?.kind ?? "BOARD"}
            className="input"
          >
            {MEETING_KIND_TUPLE.map((k) => (
              <option key={k} value={k}>
                {MEETING_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="scheduledAt">
            Date &amp; time
          </label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            required
            defaultValue={defaults?.scheduledAt}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "SCHEDULED"}
            className="input"
          >
            {MEETING_STATUS_TUPLE.map((s) => (
              <option key={s} value={s}>
                {MEETING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
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
      <div>
        <label className="label" htmlFor="location">
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          defaultValue={defaults?.location}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="agenda">
          Agenda (optional)
        </label>
        <textarea
          id="agenda"
          name="agenda"
          rows={5}
          defaultValue={defaults?.agenda}
          className="input"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save meeting"}
        </button>
        <Link href="/meetings" className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}
