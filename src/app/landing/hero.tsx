"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { FlipWords } from "@/components/ui/flip-words";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { motion } from "framer-motion";
import Image from "next/image";

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
    <div className="relative">
      {/* Blue gradient section with fixed height */}
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-400 antialiased bg-grid-trasparent/[0.02] relative overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:30px_30px]",
              "[background-image:radial-gradient(#51a2ff_1px,transparent_1px)]"
            )}
          />
          {/* Radial gradient for the container to give a faded look */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-blue-500 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <Spotlight />

          {/* Main content container with better padding and positioning */}
          <div className="flex flex-col items-center justify-center w-full px-6 z-10">
            <div className="flex flex-col items-start md:items-center justify-center gap-5 max-w-7xl w-full">
              <div className="w-full text-left md:text-center">
                <h1 className="hidden lg:block text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-white to-white/80">
                  Migliora la tua preparazione
                  <br className="hidden md:block" />
                  <span>con </span>
                  <FlipWords words={words} className="text-white" />
                </h1>
                <h1 className="block lg:hidden text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-white to-white/80">
                  <span>
                    Preparati al meglio
                    <br className="hidden md:block" />
                    <span> con</span>
                    <FlipWords words={words} className="text-white" />
                  </span>
                </h1>
                <p className="mt-4 font-normal text-md md:text-base text-white/80 max-w-lg text-left md:text-center md:mx-auto">
                  Lo strumento più avanzato per la tua preparazione all'esame di
                  maturità: teoria, esercizi, simulazioni e molto altro.
                </p>
              </div>
              <div className="flex justify-start md:justify-center w-full mt-4">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="bg-white text-black flex items-center space-x-2 py-2 px-4"
                >
                  <AceternityLogo />
                  <span className="text-base font-medium">Provalo Gratis</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1"
                  >
                    <path
                      d="M9 5L16 12L9 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </HoverBorderGradient>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White section */}
      <div className="w-full bg-white pb-60">
        {/* Empty space for image overlap */}
        <div className="h-[40vh]"></div>
      </div>

      {/* Hovering image that overlaps blue and white sections */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          delay: 1.2,
        }}
        className="absolute left-1/2 transform -translate-x-1/2 top-[85vh] z-10 rounded-xl shadow-xl mx-auto w-[90%] max-w-6xl"
      >
        <div className="w-full overflow-hidden rounded-xl">
          {/* Desktop image - only visible on md screens and above */}
          <div className="hidden md:block">
            <Image
              src="https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/hero.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL2hlcm8ucG5nIiwiaWF0IjoxNzQ2Njk1MTg1LCJleHAiOjQ5MDAyOTUxODV9.RC5RIO9Ub_QxlQVGxXxI9IvodJwHswfkg_MNjlptpN8"
              alt="Landing page preview"
              className="h-auto w-full object-cover"
              height={1000}
              width={1000}
            />
          </div>

          {/* Mobile image - only visible on small screens */}
          <div className="block md:hidden">
            <Image
              src="https://yrnoofgubhnghwauieil.supabase.co/storage/v1/object/sign/landing/mobile-hero.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBmM2JjYjBiLWU5NDgtNDY0Ny04ZGEyLWM0NjZlMTVkMzVlYiJ9.eyJ1cmwiOiJsYW5kaW5nL21vYmlsZS1oZXJvLnBuZyIsImlhdCI6MTc0NjY5NzAyMCwiZXhwIjo0OTAwMjk3MDIwfQ.m8GA7LVJ4p6QhAh5GJf1W9vHwe3KtfUMTOIwm_dNEYU"
              alt="Landing page preview (mobile)"
              className="h-auto w-full object-cover"
              height={1000}
              width={1000}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
