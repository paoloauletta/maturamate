"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export interface ThemeImageProps {
  lightImage: string;
  darkImage: string;
  mobileLightImage: string;
  mobileDarkImage: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  mobileBreakpoint?: number;
}

/**
 * A component that displays different images based on:
 * 1. Current theme (light/dark)
 * 2. Device width (mobile/desktop)
 *
 * Handles SSR by initially rendering the light desktop theme image and then updating after hydration.
 */
export function ThemeImage({
  lightImage,
  darkImage,
  mobileLightImage,
  mobileDarkImage,
  alt,
  className,
  priority = false,
  sizes = "100vw",
  mobileBreakpoint = 640, // Default to sm breakpoint (640px) from Tailwind
}: ThemeImageProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to determine mobile/desktop view
  useEffect(() => {
    // Set initial state based on window size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Check immediately
    checkIsMobile();

    // Setup resize listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [mobileBreakpoint]);

  // Only show the theme-appropriate image after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before hydration, use desktop light image
  if (!mounted) {
    return <img src={lightImage} alt={alt} className={className} />;
  }

  // After client-side hydration, determine the appropriate image based on:
  // 1. Current theme (or system preference)
  // 2. Device width (mobile/desktop)
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDarkMode = currentTheme === "dark";

  let imageSrc;
  if (isMobile) {
    // Mobile view
    imageSrc = isDarkMode ? mobileDarkImage : mobileLightImage;
  } else {
    // Desktop view
    imageSrc = isDarkMode ? darkImage : lightImage;
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}
