"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationCard } from "@/types/simulationsTypes";
import SimulationItem from "./simulation-card/card-item";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Card className="border border-border/80 dark:border-border bg-background overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label={
                isExpanded ? "Nascondi simulazioni" : "Mostra simulazioni"
              }
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
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <span>{card.subject}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <div className="flex items-center">
              <span>{card.year}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <p className="text-sm text-muted-foreground">
            {card.description.length > 120
              ? `${card.description.substring(0, 120)}...`
              : card.description}
          </p>
        </CardContent>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={expandVariants}
              className="px-6 space-y-2"
            >
              {card.simulations.map((simulation, index) => (
                <SimulationItem
                  key={simulation.id}
                  simulation={simulation}
                  index={index}
                  onToggleFavorite={onToggleFavorite}
                  formatTimeInHours={formatTimeInHours}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
