import Link from "next/link";
import { Instagram, Youtube, Linkedin, MapPin, Mail } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import Image from "next/image";

import LogoWhite from "../../public/abroadkart-logo-white.png";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-8 px-4 md:px-12 flex flex-col">
      <div className="max-w-7xl flex flex-col md:flex-row justify-center md:justify-between gap-4">
        {/* Left Section - Company Info */}
        <div className="max-w-xl">
          <Image
            src={LogoWhite}
            width={350}
            height={50}
            alt="Abroadkart logo footer"
          />
          <p className="mt-2 text-gray-400">
            Empowering Your Study Abroad Journey with Expert Guidance.
          </p>
          {/* Social Icons */}
          <div className="mt-4 flex space-x-4">
            {/* <Link href="#" className="text-gray-400 hover:text-white">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Youtube className="w-5 h-5" />
            </Link> */}
            <Link
              href="#"
              target="_blank"
              className="text-gray-400 hover:text-white"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="https://wa.me/+918318899608"
              target="_blank"
              className="text-gray-400 hover:text-white"
            >
              <BsWhatsapp className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Section - Quick Links */}
        <div className="max-w-sm">
          <h3 className="text-lg font-medium">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-gray-400">
            <li>
              <Link href="/about" target="_blank" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                target="_blank"
                className="hover:text-white"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/blogs" target="_blank" className="hover:text-white">
                Blogs
              </Link>
            </li>
          </ul>
          {/* Address & Email */}
          <div className="mt-4 text-gray-400 flex flex-row items-center gap-2">
            <MapPin className="w-5 h-5" /> E-11, Sector-1, Rohini, New Delhi -
            110085
          </div>
          <div className="text-gray-400 flex flex-row items-center gap-2">
            <Mail className="w-5 h-5" /> contact[at]abroadkart[dot]com
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="py-4 text-center text-gray-500 text-sm">
        © 2025 AbroadKart. All Rights Reserved.
      </div>
    </footer>
  );
}
