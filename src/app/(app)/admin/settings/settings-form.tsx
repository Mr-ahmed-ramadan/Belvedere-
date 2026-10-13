"use client";

import { useActionState } from "react";
import { saveSettingsAction, type ActionState } from "./actions";

const initial: ActionState = {};

export function SettingsForm({
  defaults,
}: {
  defaults: {
    whatsappResidents: string;
    whatsappBoard: string;
    heroImage: string;
    contactEmail: string;
  };
}) {
  const [state, action, pending] = useActionState(saveSettingsAction, initial);

  return (
    <form action={action} className="space-y-5">
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

      <div>
        <label className="label" htmlFor="whatsappResidents">
          Residents WhatsApp group link
        </label>
        <input
          id="whatsappResidents"
          name="whatsappResidents"
          defaultValue={defaults.whatsappResidents}
          placeholder="https://chat.whatsapp.com/…"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-500">
          Shown to everyone. In WhatsApp: group → Invite via link → Copy link.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="whatsappBoard">
          Board &amp; secretary WhatsApp group link
        </label>
        <input
          id="whatsappBoard"
          name="whatsappBoard"
          defaultValue={defaults.whatsappBoard}
          placeholder="https://chat.whatsapp.com/…"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-500">
          Shown only to directors and the secretary.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="contactEmail">
          Enquiries / management contact email
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={defaults.contactEmail}
          placeholder="enquiries@example.com"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-500">
          Shown on the public sign-in page so interested buyers, renters or
          others can reach the management company.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="heroImage">
          Landing page photo URL (optional)
        </label>
        <input
          id="heroImage"
          name="heroImage"
          defaultValue={defaults.heroImage}
          placeholder="https://…/belvedere-court.jpg"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-500">
          A photo of the building for the sign-in page. Leave blank to use the
          default illustrated banner. Use an image you have the right to use.
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
