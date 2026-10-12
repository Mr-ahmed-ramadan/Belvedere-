import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <Nav
        user={{ name: user.name, role: user.role }}
        isAdmin={isAdmin(user.role)}
      />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
