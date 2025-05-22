"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationCard } from "@/types/simulationsTypes";
import SimulationItem from "./card-item";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Animation variants
const expandVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.15 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.1 },
    },
  },
};

interface SimulationCardProps {
  card: SimulationCard;
  onToggleFavorite: (
    simulationId: string,
    e: React.MouseEvent
  ) => Promise<void>;
}

export default function SimulationCardComponent({
  card,
  onToggleFavorite,
}: SimulationCardProps) {
  const router = useRouter();

  // Convert time in minutes to hours and minutes format
  const formatTimeInHours = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "ora" : "ore"}`;
    }

    return `${hours} ${hours === 1 ? "ora" : "ore"} e ${remainingMinutes} min`;
  };

  // Handle card click to navigate to card detail page
  const handleCardClick = () => {
    router.push(`/dashboard/simulazioni/card/${card.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        },
      }}
    >
      <Card
        className="border border-border/80 hover:bg-muted/50 transition-all dark:border-border bg-background overflow-hidden h-full flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex justify-between items-start sm:items-center">
            <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="text-muted-foreground hover:text-primary transition-colors ml-2 sm:ml-0"
              aria-label="Visualizza simulazioni"
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </motion.svg>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1 sm:mt-2">
            <div className="flex items-center">
              <span>{card.subject}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <div className="flex items-center">
              <span>{card.year}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2 sm:pb-3 flex-grow">
          <p className="text-sm text-muted-foreground">
            {card.description.length > 120
              ? `${card.description.substring(0, 120)}...`
              : card.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
