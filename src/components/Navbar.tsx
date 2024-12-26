// components/Navbar.js
import Link from "next/link";

export const Navbar = () => {
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
        {/* Login Button */}
        <Link href="/login" passHref>
          <button className="ml-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
};
