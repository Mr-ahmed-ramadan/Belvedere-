import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { type Role, type ContactMethod } from "@/lib/constants";
import { AddUserForm, AddFlatForm, AddBlockForm } from "./user-forms";
import { UserRow } from "./user-row";

export default async function UsersPage() {
  const admin = await requireAdmin();

  const [users, blocks] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { flat: { include: { block: true } } },
    }),
    prisma.block.findMany({
      orderBy: { name: "asc" },
      include: { flats: { orderBy: { label: "asc" } } },
    }),
  ]);

  const blockOptions = blocks.map((b) => ({ id: b.id, name: b.name }));
  // Flat picker options, qualified by block, e.g. "Belvedere House — Flat 1".
  const flatOptions = blocks.flatMap((b) =>
    b.flats.map((f) => ({ id: f.id, label: `${b.name} — ${f.label}` })),
  );
  const totalFlats = flatOptions.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="People"
        description="Manage accounts, roles, flats and how each person prefers to be contacted. People who don't use email/tech are highlighted so the board knows to phone or post."
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
                <th className="px-3 py-2">Person &amp; contact</th>
                <th className="px-3 py-2">Role, flat &amp; preference</th>
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
                    preferredContact: u.preferredContact as ContactMethod,
                    phone: u.phone,
                    commsNotes: u.commsNotes,
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
        <h2 className="mb-1 text-lg font-semibold">
          Blocks &amp; flats ({blocks.length} block
          {blocks.length === 1 ? "" : "s"}, {totalFlats} flat
          {totalFlats === 1 ? "" : "s"})
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          The property is made up of one or more blocks; each block contains its
          own flats.
        </p>

        {blocks.length > 0 ? (
          <div className="mb-6 space-y-4">
            {blocks.map((b) => (
              <div key={b.id} className="rounded border border-gray-200 p-3">
                <div className="font-medium">{b.name}</div>
                {b.address ? (
                  <div className="text-xs text-gray-500">{b.address}</div>
                ) : null}
                {b.flats.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {b.flats.map((f) => (
                      <li
                        key={f.id}
                        className="badge bg-gray-100 text-gray-700"
                      >
                        {f.label}
                        {f.floor ? ` · ${f.floor}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">No flats yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-gray-500">No blocks added yet.</p>
        )}

        <div className="space-y-6 border-t border-gray-200 pt-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Add a block</h3>
            <AddBlockForm />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Add a flat to a block</h3>
            <AddFlatForm blocks={blockOptions} />
          </div>
        </div>
      </section>
    </div>
  );
}
