"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { FlipWords } from "@/components/ui/flip-words";
import { cn } from "@/lib/utils";

export function DotBackgroundDemo() {
  return (
    <div className="relative flex h-[50rem] w-full items-center justify-center bg-white">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
        Backgrounds
      </p>
    </div>
  );
}

export function Hero() {
  const words = ["MaturaMate"];

  return (
    <>
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-300 antialiased bg-grid-trasparent/[0.02] relative overflow-hidden light">
        <div className="relative flex h-full w-full items-center justify-center bg-transparent">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:20px_20px]",
              "[background-image:radial-gradient(#8ec5ff_1px,transparent_1px)]"
            )}
          />
          {/* Radial gradient for the container to give a faded look */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-blue-500 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)] "></div>
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
