"use client";

import Link from "next/link";
import { useActionState } from "react";
import { acceptInviteAction, type AcceptState } from "./actions";

const initialState: AcceptState = {};

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    acceptInviteAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="space-y-4">
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Your password has been set. You can now sign in.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
