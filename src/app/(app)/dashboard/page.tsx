import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} />
      <p className="text-sm text-gray-600">
        Use the menu above to view announcements, meetings, decisions, documents
        and projects.
      </p>
    </div>
  );
}
