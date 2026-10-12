"use client";

import Link from "next/link";
import { useActionState } from "react";
import { VISIBILITY_LABELS, type Visibility, type Section } from "@/lib/constants";
import { VISIBILITY_TUPLE } from "../meetings/options";
import type { ActionState } from "./actions";

const initial: ActionState = {};

type DocOption = { id: string; title: string };

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  section: Section;
  returnTo: string;
  categories: string[];
  documents: DocOption[];
  defaults?: {
    id?: string;
    category?: string;
    title?: string;
    body?: string;
    visibility?: Visibility;
    order?: number;
    documentId?: string;
  };
};

export function InfoPageForm({
  action,
  section,
  returnTo,
  categories,
  documents,
  defaults,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="returnTo" value={returnTo} />
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            name="category"
            list="info-categories"
            defaultValue={defaults?.category}
            placeholder="Choose or type a category"
            className="input"
          />
          <datalist id="info-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="order">
            Order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={defaults?.order ?? 0}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="body">
          Content
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          required
          defaultValue={defaults?.body}
          className="input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div>
          <label className="label" htmlFor="documentId">
            Attach a document (optional)
          </label>
          <select
            id="documentId"
            name="documentId"
            defaultValue={defaults?.documentId ?? ""}
            className="input"
          >
            <option value="">— none —</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <Link href={returnTo} className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}
