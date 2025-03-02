import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// ICONS
import { TbLogout } from "react-icons/tb";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";

// CONTEXT
import { useUserSession } from "@app/context/UserSessionContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, triggerLogout } = useUserSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white p-4 flex flex-col items-center justify-between transition-all duration-300 ${
          isSidebarOpen ? "w-48" : "w-16"
        }`}
      >
        {/* Sidebar Navigation */}
        <nav
          className={`space-y-4 flex flex-col ${
            isSidebarOpen ? "items-start" : "items-center"
          }`}
        >
          {/* Sidebar Toggle Button */}
          <button
            className="p-2 rounded hover:bg-gray-700 self-end"
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <RiSidebarFoldLine size={20} />
            ) : (
              <RiSidebarUnfoldLine size={20} />
            )}
          </button>

          {/* Sidebar Links */}
          <Link
            href="/dashboard"
            className={`block p-2 rounded  grow ${
              router.pathname === "/dashboard"
                ? "bg-gray-700 font-bold"
                : "hover:bg-gray-700"
            }`}
          >
            {isSidebarOpen ? "Dashboard" : "D"}
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
              {isSidebarOpen ? "Pre-Counselling" : "P"}
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
            {isSidebarOpen ? "Counselling" : "C"}
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={triggerLogout}
          className="flex flex-row items-center p-2 rounded hover:bg-gray-700"
        >
          <TbLogout size={20} />
          {isSidebarOpen && <span className="ml-2">Logout</span>}
        </button>
      </aside>

      {/* Page Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};
