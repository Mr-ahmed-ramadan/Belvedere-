"use client";

import Link from "next/link";
import { useActionState } from "react";
import { VISIBILITY_LABELS } from "@/lib/constants";
import { VISIBILITY_TUPLE } from "../meetings/options";
import {
  addReserveEntryAction,
  addBudgetLineAction,
  createBudgetAction,
  type ActionState,
} from "./actions";

const initial: ActionState = {};

export function AddReserveEntryForm() {
  const [state, action, pending] = useActionState(addReserveEntryAction, initial);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={today}
            required
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">
            Description
          </label>
          <input id="description" name="description" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            placeholder="3200 or -1250"
            required
            className="input"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Use a positive number for money in (contributions), a negative number for
        money out (spending).
      </p>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Adding…" : "Add entry"}
      </button>
    </form>
  );
}

export function CreateBudgetForm() {
  const [state, action, pending] = useActionState(createBudgetAction, initial);
  const year = new Date().getFullYear();
  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="year">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={year}
            required
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
            defaultValue="PUBLIC"
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
        <label className="label" htmlFor="title">
          Title (optional)
        </label>
        <input
          id="title"
          name="title"
          placeholder="Service charge budget"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="note">
          Note (optional)
        </label>
        <textarea id="note" name="note" rows={2} className="input" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Creating…" : "Create budget"}
        </button>
        <Link href="/finance" className="btn">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function AddBudgetLineForm({ budgetId }: { budgetId: string }) {
  const [state, action, pending] = useActionState(addBudgetLineAction, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="budgetId" value={budgetId} />
      {state.error ? (
        <p className="w-full rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="grow">
        <label className="label">Category</label>
        <input name="category" required className="input" placeholder="e.g. Cleaning" />
      </div>
      <div className="w-32">
        <label className="label">Budgeted</label>
        <input name="budgeted" className="input" placeholder="0" />
      </div>
      <div className="w-32">
        <label className="label">Actual</label>
        <input name="actual" className="input" placeholder="0" />
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Adding…" : "Add line"}
      </button>
    </form>
  );
}
