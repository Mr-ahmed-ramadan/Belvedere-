import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import {
  SECTION,
  WELCOME_CATEGORIES,
  type Visibility,
} from "@/lib/constants";
import { InfoPageForm } from "../../../_infopages/info-page-form";
import { updateInfoPageAction } from "../../../_infopages/actions";

export default async function EditWelcomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [page, documents] = await Promise.all([
    prisma.infoPage.findUnique({ where: { id } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!page || page.section !== SECTION.WELCOME) notFound();

  return (
    <div>
      <PageHeader title="Edit page" description="New to Belvedere" />
      <div className="card max-w-2xl">
        <InfoPageForm
          action={updateInfoPageAction}
          section={SECTION.WELCOME}
          returnTo="/welcome"
          categories={WELCOME_CATEGORIES}
          documents={documents}
          defaults={{
            id: page.id,
            category: page.category ?? "",
            title: page.title,
            body: page.body,
            visibility: page.visibility as Visibility,
            order: page.order,
            documentId: page.documentId ?? "",
          }}
        />
      </div>
    </div>
  );
}
