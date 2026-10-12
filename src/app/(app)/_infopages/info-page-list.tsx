import Link from "next/link";
import { Badge, VisibilityBadge, EmptyState } from "@/components/ui";
import { deleteInfoPageAction } from "./actions";

export type InfoPageItem = {
  id: string;
  category: string | null;
  title: string;
  body: string;
  visibility: string;
  document: { id: string; title: string } | null;
};

export function InfoPageList({
  pages,
  admin,
  editBase,
  returnTo,
  emptyText,
}: {
  pages: InfoPageItem[];
  admin: boolean;
  editBase: string; // e.g. "/welcome" → edit at /welcome/{id}/edit
  returnTo: string;
  emptyText: string;
}) {
  if (pages.length === 0) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  // Group by category, preserving the incoming (ordered) sequence.
  const groups = new Map<string, InfoPageItem[]>();
  for (const p of pages) {
    const key = p.category?.trim() || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {category}
          </h2>
          <div className="space-y-3">
            {items.map((p) => (
              <article key={p.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  {admin ? <VisibilityBadge visibility={p.visibility} /> : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                  {p.body}
                </p>
                {p.document ? (
                  <p className="mt-3">
                    <a
                      href={`/api/documents/${p.document.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-sm"
                    >
                      📎 {p.document.title}
                    </a>
                  </p>
                ) : null}
                {admin ? (
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`${editBase}/${p.id}/edit`}
                      className="link text-sm"
                    >
                      Edit
                    </Link>
                    <form action={deleteInfoPageAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        type="submit"
                        className="link text-sm text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                    {p.visibility === "INTERNAL" ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        Not shown to residents
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
