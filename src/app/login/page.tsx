import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Belvedere</h1>
        <p className="mb-6 text-sm text-gray-600">
          Building management — sign in to your account.
        </p>
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        No account? Ask a director or the secretary to invite you.
      </p>
    </main>
  );
}
