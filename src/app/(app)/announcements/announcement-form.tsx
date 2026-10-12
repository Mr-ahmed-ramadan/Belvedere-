"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AUDIENCE_LABELS, type Audience } from "@/lib/constants";
import { ALL_AUDIENCES_TUPLE } from "./options";
import type { ActionState } from "./actions";

const initial: ActionState = {};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: {
    id?: string;
    title?: string;
    body?: string;
    audience?: Audience;
    published?: boolean;
  };
};

export function AnnouncementForm({ action, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const isPublished = defaults?.published ?? false;

  return (
    <form action={formAction} className="space-y-4">
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}
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
        <label className="label" htmlFor="audience">
          Audience
        </label>
        <select
          id="audience"
          name="audience"
          defaultValue={defaults?.audience ?? "ALL"}
          className="input"
        >
          {ALL_AUDIENCES_TUPLE.map((a) => (
            <option key={a} value={a}>
              {AUDIENCE_LABELS[a]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="body">
          Message
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          defaultValue={defaults?.body}
          className="input"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Draft save: publish flag unset */}
        <button
          type="submit"
          name="publish"
          value="0"
          className="btn"
          disabled={pending}
        >
          {isPublished ? "Save changes" : "Save as draft"}
        </button>
        {!isPublished ? (
          <button
            type="submit"
            name="publish"
            value="1"
            className="btn btn-primary"
            disabled={pending}
          >
            {pending ? "Publishing…" : "Publish & email"}
          </button>
        ) : null}
        <Link href="/announcements" className="btn">
          Cancel
        </Link>
      </div>
      {isPublished ? (
        <p className="text-xs text-gray-500">
          This announcement is already published; editing will not re-send
          emails.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Publishing emails everyone in the chosen audience.
        </p>
      )}
    </form>
  );
}
