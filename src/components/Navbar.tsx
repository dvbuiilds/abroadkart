import { useState } from "react";
import Link from "next/link";

import { useUserSession } from "@app/context/UserSessionContext";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@app/components/ui/sheet";
import { Button } from "@app/components/ui/button";

import { ProfileMenu } from "./ProfilePic";

import { Menu, X } from "lucide-react";

export function Navbar() {
  const { activeSession, user, triggerLogout } = useUserSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-32 bg-blue-600 rounded-sm flex items-center justify-center text-white font-semibold">
                AbroadKart
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/blogs">Blogs</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/contact">Contact Us</NavLink>
            {/* Auth Actions (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {activeSession?.status === "authenticated" ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <ProfileMenu user={user} onLogout={triggerLogout} />
                </>
              ) : (
                <Link href="/login" passHref>
                  <Button
                    variant="outline"
                    className="hover:scale-105 duration-600 ease-in-out cursor-pointer hover:bg-blue-100"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu (ShadCN Sheet) */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-white">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription />
                  {/* Required for accessibility */}
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                  <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/blogs" onClick={() => setIsOpen(false)}>
                    Blogs
                  </MobileNavLink>
                  <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>
                    About Us
                  </MobileNavLink>
                  <MobileNavLink
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact Us
                  </MobileNavLink>
                  {/* Auth Actions (Mobile) */}
                  {activeSession?.status === "authenticated" ? (
                    <>
                      <MobileNavLink
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </MobileNavLink>
                      <ProfileMenu user={user} onLogout={triggerLogout} />
                    </>
                  ) : (
                    <Link href="/login" passHref>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Desktop Navigation Link with hover underline effect
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-blue-600 text-sm relative group transition duration-300"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
}

// Mobile Navigation Link
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
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition duration-150 ease-in-out"
    >
      {children}
    </Link>
  );
}
