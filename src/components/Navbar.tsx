import Link from "next/link";
import { useRouter } from "next/router";
import { useUserSession } from "@app/context/UserSessionContext";

export const Navbar = () => {
  const { activeSession, triggerLogout } = useUserSession();
  const router = useRouter();

  return (
    <nav className="bg-blue-500 py-2 px-4 text-white flex justify-between items-center">
      <div className="font-bold text-lg">
        <Link href="/" className="mx-2">
          AbroadKart
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/about" className="mx-2 text-sm">
          About
        </Link>
        <Link href="/contact" className="mx-2 text-sm">
          Contact
        </Link>
        {activeSession.status === "authenticated" ? (
          <>
            <Link href="/dashboard" className="mx-2 text-sm">
              Dashboard
            </Link>
            <Link href="/login" passHref>
              {/* Logout Button */}
              <button
                className="ml-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition"
                onClick={() => {
                  triggerLogout();
                  router.push("/login");
                }}
              >
                Logout
              </button>
            </Link>
          </>
        ) : (
          <Link href="/login" passHref>
            {/* Login Button */}
            <button className="ml-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};
