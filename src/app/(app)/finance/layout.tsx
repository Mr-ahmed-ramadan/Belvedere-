import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { canViewFinance } from "@/lib/permissions";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  // Board + landlords only. Renters and helpers are sent back to the dashboard.
  if (!canViewFinance(user.role)) redirect("/dashboard");
  return <>{children}</>;
}
