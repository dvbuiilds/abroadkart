import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUserSession } from "@app/context/UserSessionContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const { activeSession } = useUserSession();
  console.log("@Dhairya DashboardLayout");

  const sidebarTitle =
    activeSession.status === "authenticated" && activeSession.data?.user?.name
      ? `Hi ${activeSession.data?.user?.name.split(" ")[0]}`
      : null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/6 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">{sidebarTitle}</h2>
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
          <Link
            href="/dashboard/explore-universities"
            className={`block p-2 rounded ${
              router.pathname === "/dashboard/explore-universities"
                ? "bg-gray-700 font-bold"
                : "hover:bg-gray-700"
            }`}
          >
            Universities
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};
