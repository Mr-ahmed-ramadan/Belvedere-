import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { CreateBudgetForm } from "../../finance-forms";

export default async function NewBudgetPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="New budget"
        description="Create the budget, then add its line items on the next screen."
      />
      <div className="card max-w-xl">
        <CreateBudgetForm />
      </div>
    </div>
  );
}
