import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { type Role } from "@/lib/constants";
import { AddUserForm, AddFlatForm } from "./user-forms";
import { UserRow } from "./user-row";

export default async function UsersPage() {
  const admin = await requireAdmin();

  const [users, flats] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { flat: true },
    }),
    prisma.flat.findMany({ orderBy: { label: "asc" } }),
  ]);

  const flatOptions = flats.map((f) => ({ id: f.id, label: f.label }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="People"
        description="Manage accounts, roles and flats. New people receive an email to set their password."
      />

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Add a person</h2>
        <AddUserForm flats={flatOptions} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Accounts ({users.length})
        </h2>
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2">Role &amp; flat</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={{
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role as Role,
                    flatId: u.flatId,
                    active: u.active,
                    hasPassword: Boolean(u.passwordHash),
                  }}
                  flats={flatOptions}
                  isSelf={u.id === admin.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Flats ({flats.length})</h2>
        {flats.length > 0 ? (
          <ul className="mb-4 flex flex-wrap gap-2">
            {flats.map((f) => (
              <li key={f.id} className="badge bg-gray-100 text-gray-700">
                {f.label}
                {f.floor ? ` · ${f.floor}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-gray-500">No flats added yet.</p>
        )}
        <AddFlatForm />
      </section>
    </div>
  );
}
