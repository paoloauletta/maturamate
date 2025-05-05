"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is a mobile device.
 * Returns true if the screen width is less than 768px.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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

  return isMobile;
}
