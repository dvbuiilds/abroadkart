import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// COMPONENTS
import Image from "next/image";
import { ProfileMenu } from "./ProfilePic";

// ICONS
import { TbLogout } from "react-icons/tb";
import { BsLayoutTextSidebar } from "react-icons/bs";

// CONTEXT
import { useUserSession } from "@app/context/UserSessionContext";
import { User } from "@app/types/api-types";

import LogoWhite from "../../public/abroadkart-logo-white.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, triggerLogout } = useUserSession();

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Navbar */}
      <nav className="w-full bg-gray-800 shadow-sm">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <Image
                src={LogoWhite}
                width={120}
                alt="Abroadkart logo header"
                priority
              />
            </Link>
            <ProfileMenu user={user} onLogout={triggerLogout} />
          </div>
        </div>
      </nav>
      <div className="flex flex-row overflow-hidden h-screen">
        {/* Sidebar */}
        <DashboardSideBar user={user} triggerLogout={triggerLogout} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) => (
  <Link
    href={href}
    className={`block px-3 py-2 rounded transition-colors ${
      active ? "bg-gray-700 font-bold" : "hover:bg-gray-700"
    }`}
  >
    {label}
  </Link>
);

export const DashboardSideBar = ({
  user,
  triggerLogout,
}: {
  user: User | null;
  triggerLogout: () => void;
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <aside
      className={`bg-gray-800 text-white p-2 flex flex-col justify-between transition-all duration-300 ${
        isSidebarOpen ? "w-48" : "w-14"
      }`}
    >
      {/* Top: Toggle + Nav */}
      <div className="flex flex-col gap-2 flex-grow">
        {/* Toggle Button */}
        <div className="p-2 flex items-center justify-end">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="text-white"
          >
            <BsLayoutTextSidebar size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className={`${!isSidebarOpen && "hidden"} flex flex-col space-y-2`}
        >
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            active={router.pathname === "/dashboard"}
          />
          {!user?.haveFilledPreCounsellingForm && (
            <SidebarLink
              href="/dashboard/pre-counselling-form"
              label="Pre-Counselling"
              active={router.pathname === "/dashboard/pre-counselling-form"}
            />
          )}
        </nav>
      </div>

      {/* Logout */}
      {isSidebarOpen && (
        <button
          onClick={triggerLogout}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
        >
          <TbLogout />
          <span>Logout</span>
        </button>
      )}
    </aside>
  );
};
