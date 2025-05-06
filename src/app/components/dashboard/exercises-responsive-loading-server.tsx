"use client";

import { useEffect, useState } from "react";
import { ExercisesLoadingSkeleton } from "./exercises-loading-server";
import { ExercisesMobileLoadingSkeleton } from "./exercises-mobile-loading-server";

export function ExercisesResponsiveLoadingSkeleton() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // To prevent hydration mismatch, render a simple skeleton before client-side JS runs
  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded-md w-48"></div>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-40 bg-muted rounded-md"></div>
          <div className="h-40 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  return isMobile ? (
    <ExercisesMobileLoadingSkeleton />
  ) : (
    <ExercisesLoadingSkeleton />
  );
}
