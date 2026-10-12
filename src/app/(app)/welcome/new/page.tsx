import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { SECTION, WELCOME_CATEGORIES } from "@/lib/constants";
import { InfoPageForm } from "../../_infopages/info-page-form";
import { createInfoPageAction } from "../../_infopages/actions";

export default async function NewWelcomePage() {
  await requireAdmin();
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  return (
    <div>
      <PageHeader title="Add a page" description="New to Belvedere" />
      <div className="card max-w-2xl">
        <InfoPageForm
          action={createInfoPageAction}
          section={SECTION.WELCOME}
          returnTo="/welcome"
          categories={WELCOME_CATEGORIES}
          documents={documents}
        />
      </div>
    </div>
  );
}
