"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UserSimulation } from "@/types/simulationsTypes";

interface SimulationItemProps {
  simulation: UserSimulation;
  index: number;
  onToggleFavorite: (
    simulationId: string,
    e: React.MouseEvent
  ) => Promise<void>;
  formatTimeInHours: (minutes: number) => string;
}

export default function SimulationItem({
  simulation,
  index,
  onToggleFavorite,
  formatTimeInHours,
}: SimulationItemProps) {
  let simulationType = "Simulazione Completa";

  if (simulation.title.toLowerCase().includes("problem")) {
    simulationType = "Solo Problemi";
  } else if (simulation.title.toLowerCase().includes("quesit")) {
    simulationType = "Solo Quesiti";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.15,
        delay: index * 0.05, // Stagger children animations
      }}
      className="py-2 sm:py-3 first:pt-2 sm:first:pt-4 border-b border-border/30 last:border-b-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
        <div>
          <div className="text-sm font-medium">
            <span>{simulationType}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatTimeInHours(simulation.time_in_min)}</span>
            </div>

            {simulation.is_completed && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                <span>Completata</span>
              </div>
            )}

            {simulation.is_started && !simulation.is_completed && (
              <div className="flex items-center text-bg-primary dark:text-bg-primary">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>In corso</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(simulation.id, e);
            }}
            className="focus:outline-none text-muted-foreground"
            aria-label={
              simulation.is_flagged
                ? "Rimuovi dai preferiti"
                : "Aggiungi ai preferiti"
            }
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                simulation.is_flagged
                  ? "fill-yellow-400 text-yellow-400"
                  : "hover:text-yellow-400"
              )}
            />
          </motion.button>

          <Link
            href={`/dashboard/simulazioni/${simulation.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant={
                simulation.is_completed || !simulation.is_started
                  ? "outline"
                  : "default"
              }
              size="sm"
              className={cn(
                simulation.is_completed
                  ? "border-green-200 text-green-500 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                  : simulation.is_started
                  ? "bg-bg-primary hover:bg-blue-700"
                  : ""
              )}
            >
              {simulation.is_completed
                ? "Rivedi"
                : simulation.is_started
                ? "Continua"
                : "Inizia"}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
