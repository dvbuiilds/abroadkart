import { redirect } from "next/navigation";
import { getDashboardRedirectPath } from "@app/lib/dashboard-redirect";
import { DashboardPendingGate } from "@app/components/auth/DashboardPendingGate";

export default async function DashboardPage() {
  const path = await getDashboardRedirectPath();

  if (path) {
    redirect(path);
  }

  return <DashboardPendingGate />;
}
