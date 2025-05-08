"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { Hero } from "./hero";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeaturesSectionDemo } from "./features";

// Custom MaturaMate logo component
const Logo = () => {
  return (
    <Link href="/" className="relative z-20 mr-4 flex items-center px-2 py-1">
      <span className="font-extrabold text-xl text-blue-900">Matura</span>
      <span className="font-extrabold text-xl text-primary">Mate</span>
    </Link>
  );
};

export function NavbarDemo() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Prezzi",
      link: "#prezzi",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full relative light">
      <div className="absolute w-full top-5 z-50">
        <Navbar>
          {/* Desktop Navigation */}
          <NavBody className="bg-white shadow-md">
            <Logo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              {status === "loading" ? (
                <NavbarButton variant="secondary" disabled>
                  Loading...
                </NavbarButton>
              ) : session ? (
                <>
                  <NavbarButton
                    variant="secondary"
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </NavbarButton>
                  <NavbarButton
                    variant="secondary"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton variant="primary" onClick={handleGoogleLogin}>
                  Login con Google
                </NavbarButton>
              )}
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav className="bg-white shadow-md">
            <MobileNavHeader>
              <div className="pl-4">
                <Logo />
              </div>
              <div className="pr-8">
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              className="bg-white text-gray-800"
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-gray-700"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                {status === "loading" ? (
                  <NavbarButton variant="primary" className="w-full" disabled>
                    Loading...
                  </NavbarButton>
                ) : session ? (
                  <>
                    <NavbarButton
                      onClick={() => {
                        router.push("/dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="primary"
                      className="w-full"
                    >
                      Dashboard
                    </NavbarButton>
                    <NavbarButton
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setIsMobileMenuOpen(false);
                      }}
                      variant="primary"
                      className="w-full"
                    >
                      Logout
                    </NavbarButton>
                  </>
                ) : (
                  <NavbarButton
                    onClick={() => {
                      handleGoogleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Login con Google
                  </NavbarButton>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>
      <Hero />
      <FeaturesSectionDemo />
    </div>
  );
}
