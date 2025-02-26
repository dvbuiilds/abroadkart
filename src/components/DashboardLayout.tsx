import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { useUserSession } from "@app/context/UserSessionContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user } = useUserSession();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/8 bg-gray-800 text-white p-4">
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className={`block p-2 rounded ${
              router.pathname === "/dashboard"
                ? "bg-gray-700 font-bold"
                : "hover:bg-gray-700"
            }`}
          >
            Dashboard
          </Link>
          {!user?.haveFilledPreCounsellingForm ? (
            <Link
              href="/dashboard/pre-counselling-form"
              className={`block p-2 rounded ${
                router.pathname === "/dashboard/pre-counselling-form"
                  ? "bg-gray-700 font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              Pre-Counselling
            </Link>
          ) : null}
          <Link
            href="/dashboard/counselling"
            className={`block p-2 rounded ${
              router.pathname === "/dashboard/counselling"
                ? "bg-gray-700 font-bold"
                : "hover:bg-gray-700"
            }`}
          >
            Counselling
          </Link>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};
