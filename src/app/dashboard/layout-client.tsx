"use client";

import { ReactNode, useState, useEffect, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  Home,
  Book,
  BookOpen,
  ClipboardCheck,
  Bot,
  Star,
  ChartNoAxesColumn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// Dynamic imports for non-critical components
const DashboardSidebar = lazy(
  () => import("@/app/components/dashboard/sidebar")
);
const ThemeToggle = lazy(() =>
  import("@/app/components/dashboard/themeToggle").then((mod) => ({
    default: mod.ThemeToggle,
  }))
);

// Navigation links can be exported separately
export const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Teoria",
    href: "/dashboard/teoria",
    icon: Book,
  },
  {
    name: "Esercizi",
    href: "/dashboard/esercizi",
    icon: BookOpen,
  },
  {
    name: "Simulazioni",
    href: "/dashboard/simulazioni",
    icon: ClipboardCheck,
  },
  {
    type: "divider",
    label: "Il Tuo Studio",
  },
  {
    name: "Tutor",
    href: "/dashboard/tutor",
    icon: Bot,
  },
  {
    name: "Preferiti",
    href: "/dashboard/preferiti",
    icon: Star,
  },
  {
    name: "Statistiche",
    href: "/dashboard/statistiche",
    icon: ChartNoAxesColumn,
  },
];

export default function DashboardLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user has a username set
  useEffect(() => {
    const checkUsername = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/check-username");
          const data = await response.json();

          if (response.ok && !data.hasUsername) {
            router.push("/username-setup");
          }
        } catch (error) {
          console.error("Error checking username:", error);
        }
      }
    };

    if (session) {
      checkUsername();
    }
  }, [session, router]);

  // Prevent hydration errors by only rendering on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <section
      className={cn(
        "grid min-h-screen w-full",
        collapsed
          ? "md:grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr]"
          : "md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr]"
      )}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Suspense
          fallback={<div className="bg-background h-screen w-full border-r" />}
        >
          <DashboardSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onItemClick={() => {}}
          />
        </Suspense>
      </div>

      <div className="flex flex-col">
        <div className="bg-background sticky top-0 z-40">
          <header className="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6 border-b">
            {/* Mobile hamburger menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px] border-r">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Application navigation links
                </SheetDescription>
                <div className="flex h-full flex-col">
                  <Suspense
                    fallback={
                      <div className="h-full w-full flex justify-center items-center">
                        Loading...
                      </div>
                    }
                  >
                    <DashboardSidebar
                      collapsed={false}
                      setCollapsed={() => {}}
                      onItemClick={() => setMobileMenuOpen(false)}
                      isMobile={true}
                    />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-x-5">
              <Suspense fallback={<div className="h-8 w-8" />}>
                <ThemeToggle />
              </Suspense>
            </div>
          </header>
        </div>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-18 lg:py-12">
          {children}
        </main>
      </div>
    </section>
  );
}
