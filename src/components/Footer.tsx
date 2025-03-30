import Link from "next/link";
import { Instagram, Youtube, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-8 px-6">
      <div className="max-w-7xl flex flex-col md:flex-row justify-center md:justify-between gap-4">
        {/* Left Section - Company Info */}
        <div className="max-w-xl">
          <h2 className="text-5xl font-semibold">AbroadKart</h2>
          <p className="mt-2 text-gray-400">
            Empowering Your Study Abroad Journey with Expert Guidance.
          </p>
          {/* Social Icons */}
          <div className="mt-4 flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Section - Quick Links */}
        <div className="max-w-xs">
          <h3 className="text-lg font-medium">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-gray-400">
            <li>
              <Link href="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="hover:text-white">
                Blogs
              </Link>
            </li>
          </ul>
          {/* Address & Email */}
          <p className="mt-4 text-gray-400">
            E-11, Sector-1, Rohini, New Delhi - 110085
          </p>
          <p className="text-gray-400">Email: contact[at]abroadkart[dot]com</p>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="py-4 text-center text-gray-500 text-sm">
        © 2025 AbroadKart. All Rights Reserved.
      </div>
    </footer>
  );
}
