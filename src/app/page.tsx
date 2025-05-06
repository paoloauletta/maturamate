"use client";
import { NavbarDemo } from "./landing/navbar";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function Home() {
  const { setTheme } = useTheme();

  // Force light mode when landing page is loaded
  useEffect(() => {
    setTheme("light");

    // Optionally: Clean up function to restore system preference when navigating away
    return () => {
      setTheme("system");
    };
  }, [setTheme]);

  return (
    <div className="light">
      <NavbarDemo />
    </div>
  );
}
