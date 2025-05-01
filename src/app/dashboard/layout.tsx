"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/sidebar";
import {
  Book,
  BookOpen,
  Bot,
  ChartNoAxesColumn,
  CircleUser,
  ClipboardCheck,
  Home,
  LogOut,
  Star,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "../components/dashboard/themeToggle";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
        <DashboardSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onItemClick={() => {}}
        />
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
                  <DashboardSidebar
                    collapsed={false}
                    setCollapsed={() => {}}
                    onItemClick={() => setMobileMenuOpen(false)}
                    isMobile={true}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-x-5">
              <ThemeToggle />
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
