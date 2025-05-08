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
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

// Custom MaturaMate logo component
const Logo = () => {
  return (
    <Link href="/" className="relative z-20 mr-4 flex items-center px-2 py-1">
      <span className="font-extrabold text-xl text-blue-900 dark:text-primary">
        Matura
      </span>
      <span className="font-extrabold text-xl text-primary dark:text-blue-400">
        Mate
      </span>
    </Link>
  );
};

// Simple, reliable theme toggle component
const ThemeToggle = () => {
  // Use regular DOM manipulation for theme toggle
  const handleClick = () => {
    // Get and toggle the current dark mode state
    const isDarkMode = document.documentElement.classList.contains("dark");
    const newDarkMode = !isDarkMode;

    // Apply the change to the document
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full"
      title="Toggle dark mode"
    >
      {/* Always show both icons with visibility controlled by CSS */}
      <Sun className="absolute h-5 w-5 text-gray-800 transition-opacity duration-300 opacity-100 dark:opacity-0" />
      <Moon className="absolute h-5 w-5 transition-opacity duration-300 opacity-0 dark:opacity-100" />
    </button>
  );
};

// Define the scroll handler component
const ScrollLink = ({
  href,
  children,
  section,
  onClick = () => {},
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  section: string;
  onClick?: () => void;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Call any additional onClick handler
    onClick();

    console.log(`Trying to scroll to section: ${section}`);

    if (section === "top") {
      console.log("Scrolling to top");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // Try to find the element
    const element = document.getElementById(section);

    if (element) {
      console.log(`Found element with id ${section}, scrolling now`);
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.error(`Element with id "${section}" not found`);
      // Show all available ids for debugging
      const allIds = Array.from(document.querySelectorAll("[id]")).map(
        (el) => el.id
      );
      console.log("Available IDs on page:", allIds);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  // Initialize dark mode on mount
  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Set initial state
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="w-full fixed top-0 z-50">
      <div className="absolute w-full top-5 z-50">
        <Navbar disableShrink>
          {/* Desktop Navigation */}
          <NavBody className="bg-white dark:bg-neutral-900 shadow-md">
            <Logo />

            {/* Custom navigation links with direct scroll handling */}
            <div className="hidden md:flex items-center space-x-6">
              <ScrollLink
                href="/"
                section="top"
                className="text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Home
              </ScrollLink>
              <ScrollLink
                href="#features"
                section="features"
                className="text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Features
              </ScrollLink>
              <ScrollLink
                href="#prezzi"
                section="prezzi"
                className="text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Prezzi
              </ScrollLink>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
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
                </>
              ) : (
                <NavbarButton variant="primary" onClick={handleGoogleLogin}>
                  Login con Google
                </NavbarButton>
              )}
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav className="bg-white dark:bg-neutral-900 shadow-md">
            <MobileNavHeader>
              <div className="pl-4">
                <Logo />
              </div>
              <div className="flex items-center gap-2 pr-8">
                <ThemeToggle />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              className="bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200"
            >
              <ScrollLink
                href="/"
                section="top"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-gray-700 dark:text-gray-300 block py-2"
              >
                <span className="block">Home</span>
              </ScrollLink>

              <ScrollLink
                href="#features"
                section="features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-gray-700 dark:text-gray-300 block py-2"
              >
                <span className="block">Features</span>
              </ScrollLink>

              <ScrollLink
                href="#prezzi"
                section="prezzi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-gray-700 dark:text-gray-300 block py-2"
              >
                <span className="block">Prezzi</span>
              </ScrollLink>

              <div className="flex w-full flex-col gap-4 mt-4">
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
    </div>
  );
}
