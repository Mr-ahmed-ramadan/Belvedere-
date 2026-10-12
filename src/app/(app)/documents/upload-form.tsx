"use client";

import { useActionState } from "react";
import { VISIBILITY_LABELS } from "@/lib/constants";
import { VISIBILITY_TUPLE } from "../meetings/options";
import { uploadDocumentAction, type ActionState } from "./actions";

const initial: ActionState = {};

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadDocumentAction, initial);

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
          <label className="label" htmlFor="title">
            Title
          </label>
          <input id="title" name="title" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="category">
            Category (optional)
          </label>
          <input
            id="category"
            name="category"
            placeholder="e.g. Insurance, Accounts"
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
            defaultValue="INTERNAL"
            className="input"
          >
            {VISIBILITY_TUPLE.map((v) => (
              <option key={v} value={v}>
                {VISIBILITY_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="file">
            File (max 10 MB)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="input py-1.5"
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Uploading…" : "Upload document"}
      </button>
    </form>
  );
}
