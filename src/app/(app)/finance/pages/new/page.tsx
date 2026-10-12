import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { SECTION, FINANCE_CATEGORIES } from "@/lib/constants";
import { InfoPageForm } from "../../../_infopages/info-page-form";
import { createInfoPageAction } from "../../../_infopages/actions";

export default async function NewFinancePage() {
  await requireAdmin();
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  return (
    <div>
      <PageHeader title="Add a page" description="Finance" />
      <div className="card max-w-2xl">
        <InfoPageForm
          action={createInfoPageAction}
          section={SECTION.FINANCE}
          returnTo="/finance"
          categories={FINANCE_CATEGORIES}
          documents={documents}
        />
      </div>
    </div>
  );
}
