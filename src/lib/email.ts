import { Resend } from "resend";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

const FROM = process.env.EMAIL_FROM || "Belvedere <noreply@example.com>";

/**
 * Send an email. In development (EMAIL_PROVIDER=console, the default) messages
 * are printed to the server console so the app runs with no external account.
 * Set EMAIL_PROVIDER=resend + RESEND_API_KEY in production to actually send.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER || "console";
  const recipients = Array.isArray(message.to) ? message.to : [message.to];

  if (recipients.length === 0) return;

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return;
  }

  // Console fallback.
  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "──────────── EMAIL (console mode) ────────────",
      `From:    ${FROM}`,
      `To:      ${recipients.join(", ")}`,
      `Subject: ${message.subject}`,
      "----------------------------------------------",
      message.text,
      "──────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}

/** Send the same email to many recipients, one message each (best effort). */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const unique = Array.from(new Set(recipients.filter(Boolean)));
  if (unique.length === 0) return;
  // Resend accepts an array of recipients in a single call; console mode too.
  await sendEmail({ to: unique, subject, text, html });
}
