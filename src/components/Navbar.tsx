import Link from "next/link";
import { useRouter } from "next/router";
import { useUserSession } from "@app/context/UserSessionContext";
import { ProfilePic } from "./ProfilePic";
import { RxHamburgerMenu } from "react-icons/rx";
import { TfiMenu } from "react-icons/tfi";

export const Navbar = () => {
  const { activeSession, user } = useUserSession();
  const router = useRouter();

  const ProfilePicComponent = user?.picture ? (
    <ProfilePic profilePicPresent={true} src={user.picture} alt={user.name} />
  ) : (
    <ProfilePic
      profilePicPresent={false}
      nameAbbreviation={user?.nameAbbreviation || "XX"}
    />
  );

  return (
    <nav className="bg-blue-500 py-2 px-4 text-white flex justify-between items-center">
      {/* Logo */}
      <div className="font-bold text-lg">
        <Link href="/" className="mx-2">
          AbroadKart
        </Link>
      </div>

      {/* Mobile Menu using <details> */}
      <details className="md:hidden relative">
        <summary className="text-white cursor-pointer flex items-center">
          <RxHamburgerMenu size={24} className="block details-close:hidden" />
          <TfiMenu size={24} className="hidden details-close:block" />
        </summary>

        {/* Sidebar Menu */}
        <div className="absolute right-0 top-full bg-white shadow-lg flex flex-col p-4 gap-4 border rounded">
          <Link href="/about" className="text-sm text-gray-500">
            About
          </Link>
          <Link href="/contact" className="text-sm text-gray-500">
            Contact
          </Link>
          {activeSession.status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-500">
                Dashboard
              </Link>
              {ProfilePicComponent}
            </>
          ) : (
            <Link href="/login" passHref>
              <button className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition w-full">
                Login
              </button>
            </Link>
          )}
        </div>
      </details>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/about" className="text-sm">
          About
        </Link>
        <Link href="/contact" className="text-sm">
          Contact
        </Link>
        {activeSession.status === "authenticated" ? (
          <>
            <Link href="/dashboard" className="text-sm">
              Dashboard
            </Link>
            {ProfilePicComponent}
          </>
        ) : (
          <Link href="/login" passHref>
            <button className="ml-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};
