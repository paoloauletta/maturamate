"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { navLinks } from "@/app/components/dashboard/dashboard-layout";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LogOut,
  Settings,
  Sparkles,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onItemClick?: () => void;
  isMobile?: boolean;
}

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
  onItemClick,
  isMobile = false,
}: SidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  // Function to check if a link should be active based on the current pathname
  const isLinkActive = (href: string): boolean => {
    // Special case for dashboard home
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }

    // For other routes, check if the pathname starts with the href
    if (href !== "/dashboard") {
      return pathname.startsWith(href + "/") || pathname === href;
    }

    return false;
  };

  // Mock user subscription data
  const subscriptionData = {
    plan: "Free",
    simulationsLeft: 3,
    aiCredits: 20,
  };

  // Handle navigation with mobile menu closing
  const handleMobileItemClick = (href: string) => {
    if (onItemClick) {
      onItemClick();
    }
    router.push(href);
  };

  // Handle settings navigation
  const handleSettingsClick = () => {
    if (onItemClick) {
      onItemClick();
    }
    router.push("/dashboard/settings");
  };

  // Get first letter of name or email for avatar fallback
  const getAvatarFallback = () => {
    if (user?.name) return user.name[0];
    if (user?.email) return user.email[0];
    return "U";
  };

  // Get user's full name or email
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    return "";
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background",
        isMobile ? "h-full" : "h-screen sticky top-0 left-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] justify-between">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <h3 className="text-2xl">
              <span className="text-blue-900 dark:text-primary">Matura</span>
              <span className="text-primary dark:text-blue-400">Mate</span>
            </h3>
          </Link>
        ) : (
          <span className="w-full text-center text-2xl font-bold text-primary dark:text-primary">
            M
          </span>
        )}
      </div>

      {/* User Profile Section */}
      <div
        className={cn("p-4 border-b", collapsed ? "flex justify-center" : "")}
      >
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {user?.image ? (
                  <AvatarImage
                    src={user.image}
                    alt={getUserDisplayName()}
                    onError={(e) => {
                      // On error, hide the image and let the fallback show
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="px-2 py-1 text-xs bg-primary/5"
              >
                {subscriptionData.plan}
              </Badge>

              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSettingsClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Upgrade to Pro</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Subscription features */}
            {!isMobile && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-muted/50 p-2 rounded-md text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">Simulazioni</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rimaste</span>
                    <Badge variant="secondary" className="ml-auto">
                      {subscriptionData.simulationsLeft}
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted/50 p-2 rounded-md text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">Crediti AI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rimasti</span>
                    <Badge variant="secondary">
                      {subscriptionData.aiCredits}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <TooltipProvider>
            {isMobile ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar
                    className="h-10 w-10 cursor-pointer"
                    onClick={handleSettingsClick}
                  >
                    {user?.image ? (
                      <AvatarImage
                        src={user.image}
                        alt={getUserDisplayName()}
                        onError={(e) => {
                          // On error, hide the image and let the fallback show
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-xs font-medium">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {subscriptionData.plan}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    {user?.image ? (
                      <AvatarImage
                        src={user.image}
                        alt={getUserDisplayName()}
                        onError={(e) => {
                          // On error, hide the image and let the fallback show
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-48">
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TooltipProvider>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="grid items-start gap-2 relative w-full">
          {navLinks.map((link, index) => {
            if (link.type === "divider") {
              return (
                <div key={index} className="relative mt-6">
                  {!collapsed && (
                    <>
                      <div className="px-2 flex flex-col w-full">
                        <p className="text-xs font-medium text-muted-foreground ">
                          {link.label}
                        </p>
                        <Separator className="my-2" />
                      </div>
                    </>
                  )}
                  {collapsed && <Separator className="my-4" />}
                </div>
              );
            }

            if (link.href && link.icon) {
              const Icon = link.icon;

              return (
                <TooltipProvider key={link.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isMobile ? (
                        // For mobile, we need to close the menu on navigation
                        <div
                          onClick={() => handleMobileItemClick(link.href!)}
                          className={cn(
                            "flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors cursor-pointer relative w-full",
                            isLinkActive(link.href)
                              ? "bg-accent text-primary dark:text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {!collapsed && <span>{link.name}</span>}
                        </div>
                      ) : (
                        // For desktop, we can use Link directly
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors cursor-pointer relative w-full",
                            isLinkActive(link.href)
                              ? "bg-accent text-primary dark:text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {!collapsed && <span>{link.name}</span>}
                        </Link>
                      )}
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return null;
          })}
        </nav>
      </div>

      {/* Collapse button - hide on mobile */}
      {!isMobile && (
        <div className="border-t p-2 flex justify-end pr-4">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={() => setCollapsed(!collapsed)}
            className={cn("transition-all", collapsed ? "h-8 w-8" : "gap-2")}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs">Comprimi</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
