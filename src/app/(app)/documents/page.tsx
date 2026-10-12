import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { visibilityFilter } from "@/lib/visibility";
import {
  PageHeader,
  EmptyState,
  Badge,
  VisibilityBadge,
  formatDate,
} from "@/components/ui";
import { UploadForm } from "./upload-form";
import { deleteDocumentAction } from "./actions";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const documents = await prisma.document.findMany({
    where: visibilityFilter(user.role),
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Shared files for the building — insurance, accounts, notices and more."
      />

      {admin ? (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Upload a document</h2>
          <UploadForm />
        </section>
      ) : null}

      <section>
        {documents.length === 0 ? (
          <EmptyState>No documents available.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2">Size</th>
                  {admin ? <th className="px-3 py-2"></th> : null}
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-t border-gray-200">
                    <td className="px-3 py-2">
                      <a
                        href={`/api/documents/${d.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium link"
                      >
                        {d.title}
                      </a>
                      <div className="text-xs text-gray-500">
                        {d.originalName} · by {d.uploadedBy.name}
                      </div>
                      {admin ? (
                        <div className="mt-1">
                          <VisibilityBadge visibility={d.visibility} />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      {d.category ? (
                        <Badge>{d.category}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {formatSize(d.size)}
                    </td>
                    {admin ? (
                      <td className="px-3 py-2 text-right">
                        <form action={deleteDocumentAction}>
                          <input type="hidden" name="id" value={d.id} />
                          <button
                            type="submit"
                            className="link text-xs text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
