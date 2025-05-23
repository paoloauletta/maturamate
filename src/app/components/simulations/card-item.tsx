"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UserSimulation } from "@/types/simulationsTypes";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  // Determine the referrer based on the current path
  let referrer = "simulazioni";
  if (pathname.includes("/statistiche")) {
    referrer = "statistiche";
  } else if (pathname.includes("/preferiti")) {
    referrer = "preferiti";
  }

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
        delay: index * 0.05,
      }}
      className="bg-muted/40 border border-border rounded-xl p-4 md:p-6 flex flex-col justify-between items-center gap-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start justify-center gap-1 md:gap-2 w-full">
        <div className="text-base font-semibold">
          <span>{simulationType}</span>
        </div>
        <div className="flex flex-row justify-between w-full gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTimeInHours(simulation.time_in_min)}</span>
            </div>
            {simulation.is_completed && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="md:block hidden">Completata</span>
              </div>
            )}
            {simulation.is_started && !simulation.is_completed && (
              <div className="flex items-center text-bg-primary dark:text-bg-primary">
                <Clock className="h-4 w-4 mr-1" />
                <span className="md:block hidden">In corso</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                simulation.is_flagged
                  ? "fill-yellow-400 text-yellow-400 cursor-pointer"
                  : "hover:text-yellow-400 hover:scale-110 transition-all cursor-pointer"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(simulation.id, e);
              }}
            />
            <Link
              href={`/dashboard/simulazioni/${simulation.id}?referrer=${referrer}`}
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
                  "px-4 py-1.5 text-sm font-semibold rounded-md",
                  simulation.is_completed
                    ? "border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-500"
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
      </div>
    </motion.div>
  );
}
