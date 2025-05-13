"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is a mobile device.
 * Returns object with isMobile flag and mounted state for hydration safety.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setMounted(true);

    // Default to false on the server
    if (typeof window === "undefined") {
      return;
    }

    // Function to update state based on window width
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check immediately
    checkIsMobile();

    // Set up event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return { isMobile, mounted };
}
