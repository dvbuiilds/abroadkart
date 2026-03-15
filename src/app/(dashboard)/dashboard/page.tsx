import { redirect } from "next/navigation";
import { getDashboardRedirectPath } from "@app/lib/dashboard-redirect";

export default async function DashboardPage() {
  const path = await getDashboardRedirectPath();

  if (path) {
    redirect(path);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Access Pending
      </h1>
      <p className="text-gray-600 text-center max-w-md">
        You don&apos;t have access to the dashboard yet. Please wait until you
        are assigned a role, or contact your administrator if you believe this
        is an error.
      </p>
    </div>
  );
}
