"use client";

import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "@/app/dashboard/layout";
import { cn } from "@/lib/utils";

interface DashboardItemsProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

export default function DashboardItems({
  collapsed = false,
  onItemClick,
}: DashboardItemsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onItemClick) {
      onItemClick();
    }
    router.push(href);
  };

  // Function to check if a link should be active based on the current pathname
  const isLinkActive = (href: string): boolean => {
    // Special case for dashboard home
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // For other routes, check if the pathname starts with the href
    // but make sure we don't match partial segments (e.g. /dashboard/teorica shouldn't match /dashboard/teori)
    if (href !== '/dashboard') {
      return pathname.startsWith(href + '/') || pathname === href;
    }
    
    return false;
  };

  return (
    <>
      {navLinks.map((link, index) => {
        if (link.type === "divider") {
          return (
            <div key={index} className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              {!collapsed && (
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    {link.label}
                  </span>
                </div>
              )}
            </div>
          );
        }

        const Icon = link.icon;

        // Only render if we have an Icon and href
        if (Icon && link.href) {
          return (
            <div
              key={link.href}
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors my-1 cursor-pointer",
                isLinkActive(link.href)
                  ? "bg-accent text-primary dark:text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={(e) => handleLinkClick(link.href!, e)}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{link.name}</span>}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
