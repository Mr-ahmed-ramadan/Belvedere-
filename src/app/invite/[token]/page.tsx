import Link from "next/link";
import { validateInvite } from "@/lib/invites";
import { AcceptInviteForm } from "./accept-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const validation = await validateInvite(token);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Belvedere</h1>
        {validation.ok ? (
          <>
            <p className="mb-6 text-sm text-gray-600">
              Welcome, {validation.name}. Set a password for{" "}
              <strong>{validation.email}</strong> to activate your account.
            </p>
            <AcceptInviteForm token={token} />
          </>
        ) : (
          <>
            <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {validation.reason}
            </p>
            <Link href="/login" className="link text-sm">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
