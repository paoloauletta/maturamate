"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";

export function Hero() {
  return (
    <>
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-300 antialiased bg-grid-white/[0.02] relative overflow-hidden light">
        <Spotlight />
        <div className="px-6 max-w-7xl mx-auto relative w-full text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-l from-neutral-200 to-neutral-50 bg-opacity-50">
            Migliora la tua preparazione <br className="hidden md:block" /> con
            MaturaMate
          </h1>
          <p className="mt-4 font-normal text-base text-white max-w-lg text-center mx-auto">
            Lo strumento più avanzato per la tua preparazione all'esame di
            maturità: Teoria, esercizi, simulazioni e molto altro.
          </p>
        </div>
      </div>
    </>
  );
}
