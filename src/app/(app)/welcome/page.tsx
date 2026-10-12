import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { SECTION } from "@/lib/constants";
import { PageHeader, LinkButton } from "@/components/ui";
import { InfoPageList, type InfoPageItem } from "../_infopages/info-page-list";

export default async function WelcomePage() {
  const user = await requireUser();
  const admin = isAdmin(user.role);

  const pages = await prisma.infoPage.findMany({
    where: {
      section: SECTION.WELCOME,
      ...(admin ? {} : { visibility: "PUBLIC" }),
    },
    orderBy: [{ category: "asc" }, { order: "asc" }, { title: "asc" }],
    include: { document: { select: { id: true, title: true } } },
  });

  return (
    <div>
      <PageHeader
        title="New to Belvedere"
        description="Everything you need to know about living here — facilities, rules, access and key contacts."
        action={
          admin ? (
            <LinkButton href="/welcome/new" variant="primary">
              Add page
            </LinkButton>
          ) : null
        }
      />
      <InfoPageList
        pages={pages as InfoPageItem[]}
        admin={admin}
        editBase="/welcome"
        returnTo="/welcome"
        emptyText="No information has been added yet."
      />
    </div>
  );
}
