import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { DecisionForm } from "../decision-form";
import { createDecisionAction } from "../actions";

export default async function NewDecisionPage({
  searchParams,
}: {
  searchParams: Promise<{ meetingId?: string }>;
}) {
  await requireAdmin();
  const { meetingId } = await searchParams;

  const meetings = await prisma.meeting.findMany({
    orderBy: { scheduledAt: "desc" },
    select: { id: true, title: true },
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="Record a decision" />
      <div className="card max-w-2xl">
        <DecisionForm
          action={createDecisionAction}
          meetings={meetings}
          defaults={{ decidedAt: today, meetingId }}
        />
      </div>
    </div>
  );
}
