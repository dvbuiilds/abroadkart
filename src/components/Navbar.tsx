"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@app/components/ui/sheet";
import { Button } from "@app/components/ui/button";

import { Menu, X } from "lucide-react";

import LogoBlack from "../../public/abroadkart-logo-black.png";
import LogoWhite from "../../public/abroadkart-logo-white.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <nav
        className={`w-full fixed top-0 z-50 ${
          isHome
            ? "navbar-scroll-animate"
            : "bg-white/80 backdrop-blur-lg shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo — full wordmark, crossfades via CSS scroll animation on homepage */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center relative">
                {isHome ? (
                  <>
                    <Image
                      src={LogoWhite}
                      width={140}
                      alt="Abroadkart logo header"
                      priority
                      className="logo-white-animate"
                    />
                    <Image
                      src={LogoBlack}
                      width={50}
                      alt=""
                      aria-hidden="true"
                      className="absolute left-0 logo-black-animate"
                    />
                  </>
                ) : (
                  <Image
                    src={LogoBlack}
                    width={50}
                    alt="Abroadkart logo header"
                    priority
                  />
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="/" isHome={isHome}>
                Home
              </NavLink>
              <NavLink href="https://abroadkart.com" isHome={isHome}>
                Blogs
              </NavLink>
              <NavLink href="/about" isHome={isHome}>
                About Us
              </NavLink>
              <NavLink href="/contact" isHome={isHome}>
                Contact Us
              </NavLink>

              {/* Auth Actions */}
              <div className="flex items-center space-x-4">
                <SignedIn>
                  <NavLink href="/dashboard" isHome={isHome}>
                    Dashboard
                  </NavLink>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in">
                    <button
                      className={`px-6 h-10 rounded-full text-sm font-semibold text-white border transition-all duration-300 cursor-pointer ${
                        isHome
                          ? "nav-button-animate hover:brightness-110"
                          : "bg-blue-600 border-blue-600 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                      }`}
                    >
                      Login
                    </button>
                  </Link>
                </SignedOut>
              </div>
            </div>

            {/* Mobile Menu (ShadCN Sheet) */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={
                      isHome
                        ? "nav-icon-animate hover:bg-white/10"
                        : "text-gray-900"
                    }
                  >
                    {isOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 bg-white border-r border-gray-100"
                >
                  <SheetHeader className="px-2 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <Image
                        src={LogoBlack}
                        width={120}
                        alt="Abroadkart logo"
                      />
                    </div>
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SheetDescription className="sr-only">
                      Main navigation menu
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 p-4">
                    <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
                      Home
                    </MobileNavLink>
                    <MobileNavLink
                      href="https://abroadkart.com"
                      onClick={() => setIsOpen(false)}
                    >
                      Blogs
                    </MobileNavLink>
                    <MobileNavLink
                      href="/about"
                      onClick={() => setIsOpen(false)}
                    >
                      About Us
                    </MobileNavLink>
                    <MobileNavLink
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact Us
                    </MobileNavLink>
                    <SignedIn>
                      <MobileNavLink
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </MobileNavLink>
                      <div className="flex items-center gap-3 px-3 py-2 mt-2">
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-sm font-medium text-gray-600">
                          Account
                        </span>
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <div className="pt-4 px-3">
                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                          <button className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-all duration-300 cursor-pointer">
                            Login
                          </button>
                        </Link>
                      </div>
                    </SignedOut>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer — pushes content below the fixed navbar on non-home pages.
           On the homepage the hero is min-h-screen so the transparent navbar overlays it. */}
      {!isHome && <div className="h-16" />}
    </>
  );
}

/**
 * Desktop NavLink — on the homepage, color and underline animate via CSS
 * scroll-driven animations; on other pages, static Tailwind classes apply.
 */
function NavLink({
  href,
  children,
  isHome,
}: {
  href: string;
  children: React.ReactNode;
  isHome: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-semibold tracking-wide relative group transition-colors duration-300 ${
        isHome
          ? "nav-link-animate hover:text-blue-600"
          : "text-gray-700 hover:text-blue-600"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
          isHome ? "nav-underline-animate" : "bg-blue-600"
        }`}
      />
    </Link>
  );
}

// Mobile Navigation Link — always on white background (inside Sheet)
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 rounded-lg text-sm font-medium tracking-wide text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
    >
      {children}
    </Link>
  );
}
