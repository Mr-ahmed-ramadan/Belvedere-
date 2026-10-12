import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { type Visibility } from "@/lib/constants";
import { DecisionForm } from "../../decision-form";
import { updateDecisionAction, deleteDecisionAction } from "../../actions";

export default async function EditDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [decision, meetings] = await Promise.all([
    prisma.decision.findUnique({ where: { id } }),
    prisma.meeting.findMany({
      orderBy: { scheduledAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!decision) notFound();

  return (
    <div>
      <PageHeader title="Edit decision" />
      <div className="card max-w-2xl">
        <DecisionForm
          action={updateDecisionAction}
          meetings={meetings}
          defaults={{
            id: decision.id,
            title: decision.title,
            detail: decision.detail,
            decidedAt: decision.decidedAt.toISOString().slice(0, 10),
            visibility: decision.visibility as Visibility,
            meetingId: decision.meetingId ?? "",
          }}
        />
      </div>
      <form action={deleteDecisionAction} className="mt-4 max-w-2xl">
        <input type="hidden" name="id" value={decision.id} />
        <button type="submit" className="btn btn-danger">
          Delete decision
        </button>
      </form>
    </div>
  );
}
