"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { FlipWords } from "@/components/ui/flip-words";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function HoverBorderGradientDemo() {
  return (
    <div className="m-40 flex justify-center text-center">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="bg-white text-black flex items-center space-x-2"
      >
        <AceternityLogo />
        <span>Aceternity UI</span>
      </HoverBorderGradient>
    </div>
  );
}

const AceternityLogo = () => {
  return (
    <>
      <svg
        width="66"
        height="65"
        viewBox="0 0 66 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 text-black"
      >
        <path
          d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
          stroke="currentColor"
          strokeWidth="15"
          strokeMiterlimit="3.86874"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
};

export function Hero() {
  const words = ["MaturaMate"];

  return (
    <>
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-400 antialiased bg-grid-trasparent/[0.02] relative overflow-hidden light">
        <div className="relative flex h-full w-full items-center justify-center bg-transparent">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:30px_30px]",
              "[background-image:radial-gradient(#51a2ff_1px,transparent_1px)]"
            )}
          />
          {/* Radial gradient for the container to give a faded look */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-blue-500 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] "></div>
          <Spotlight />
          <div className="px-6 max-w-7xl mx-auto relative w-full text-center">
            <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-l from-neutral-200 to-neutral-50 bg-opacity-50">
              Migliora la tua preparazione <br className="hidden md:block" />{" "}
              con
              <FlipWords words={words} className="text-muted" />
            </h1>
            <p className="mt-4 font-normal text-base text-muted max-w-lg text-center mx-auto">
              Lo strumento più avanzato per la tua preparazione all'esame di
              maturità: teoria, esercizi, simulazioni e molto altro.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
