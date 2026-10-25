import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@app/lib/admin-auth";
import { getKeystoneBaseUrl } from "@app/lib/keystone-url";

export default async function AdminEntryPage() {
  const authResult = await getAdminAuth();

  if (authResult.status === "unauthenticated") {
    redirect("/sign-in?callbackUrl=/admin");
  }

  if (authResult.status === "forbidden") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need a superAdmin role to access the Keystone Admin dashboard.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex rounded-md border px-3 py-2 text-sm"
            >
              Back to app dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /** Super-admins use native Keystone Admin (stable HMR / GraphQL). See crm_docs/REQUIREMENTS_SUPER_ADMIN_KEYSTONE_NATIVE.md */
  redirect(`${getKeystoneBaseUrl()}/admin`);
}
