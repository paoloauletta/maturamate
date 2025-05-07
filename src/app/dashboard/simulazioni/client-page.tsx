"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Calendar, School, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

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

interface Simulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  time_in_min: number;
  is_complete: boolean;
  is_completed: boolean;
  is_started: boolean;
  is_flagged: boolean;
  card_id: string; // New property to link simulation to its card
}

interface SimulationCard {
  id: string;
  title: string;
  description: string;
  year: number;
  subject: string;
  simulations: Simulation[];
}

interface ClientSimulationsPageProps {
  simulationCardsByYear: Record<number, SimulationCard[]>;
  sortedYears: number[];
  userId: string;
}

export default function ClientSimulationsPage({
  simulationCardsByYear,
  sortedYears,
  userId,
}: ClientSimulationsPageProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [localSimulationCards, setLocalSimulationCards] = useState(
    simulationCardsByYear
  );

  // Get unique subjects for filter dropdown
  const allCards = Object.values(simulationCardsByYear).flat();
  const subjects = Array.from(
    new Set(allCards.map((card) => card.subject))
  ).sort();

  // Filter simulation cards by subject if a filter is applied
  const filterSimulationCards = (cards: SimulationCard[]) => {
    if (subjectFilter === "all") return cards;
    return cards.filter((card) => card.subject === subjectFilter);
  };

  // Toggle simulation favorite status
  const toggleFavorite = async (simulationId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    e.stopPropagation();

    try {
      const response = await fetch("/api/simulations/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationId,
        }),
      });

      if (response.ok) {
        // Update local state to reflect the change immediately
        setLocalSimulationCards((prev) => {
          const updated = { ...prev };

          // Update the simulation's is_flagged status in all years and cards
          Object.keys(updated).forEach((year) => {
            const yearNum = parseInt(year);
            updated[yearNum] = updated[yearNum].map((card) => {
              return {
                ...card,
                simulations: card.simulations.map((sim) => {
                  if (sim.id === simulationId) {
                    return { ...sim, is_flagged: !sim.is_flagged };
                  }
                  return sim;
                }),
              };
            });
          });

          return updated;
        });
      }
    } catch (error) {
      console.error("Error toggling simulation favorite:", error);
    }
  };

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
    <div className="">
      <div className="flex justify-between items-center lg:mt-0 lg:mb-8 lg:pb-4 border-b border-border my-6 pb-2">
        <h1 className="text-4xl font-bold text-left">Simulazioni</h1>
      </div>

      {sortedYears.length > 0 ? (
        sortedYears.map((year) => {
          const filteredCards = filterSimulationCards(
            localSimulationCards[year]
          );

          // Skip rendering year section if no simulation cards match filter
          if (filteredCards.length === 0) return null;

          return (
            <div key={year} className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 text-foreground/95 border-b border-muted pb-2">
                Simulazioni {year}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCards.map((card) => {
                  const [isExpanded, setIsExpanded] = useState(false);
                  return (
                    <motion.div
                      key={card.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="border border-border/80 dark:border-border bg-background overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl">
                              {card.title}
                            </CardTitle>
                            <button
                              onClick={() => setIsExpanded(!isExpanded)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={
                                isExpanded
                                  ? "Nascondi simulazioni"
                                  : "Mostra simulazioni"
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
                              <School className="h-4 w-4 mr-1.5" />
                              <span>{card.subject}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1.5" />
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
                              {card.simulations.map((simulation, index) => {
                                let simulationType = "Simulazione Completa";

                                if (
                                  simulation.title
                                    .toLowerCase()
                                    .includes("problem")
                                ) {
                                  simulationType = "Solo Problemi";
                                } else if (
                                  simulation.title
                                    .toLowerCase()
                                    .includes("quesit")
                                ) {
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
                                    key={simulation.id}
                                    className="py-3 first:pt-4 border-b border-border/30 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-sm font-medium">
                                          <span>{simulationType}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                          <div className="flex items-center">
                                            <Clock className="h-3.5 w-3.5 mr-1" />
                                            <span>
                                              {formatTimeInHours(
                                                simulation.time_in_min
                                              )}
                                            </span>
                                          </div>

                                          {simulation.is_completed && (
                                            <div className="flex items-center text-green-600 dark:text-green-400">
                                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                              <span>Completata</span>
                                            </div>
                                          )}

                                          {simulation.is_started &&
                                            !simulation.is_completed && (
                                              <div className="flex items-center text-bg-primary dark:text-bg-primary">
                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                <span>In corso</span>
                                              </div>
                                            )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <motion.button
                                          whileTap={{ scale: 0.9 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(simulation.id, e);
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
                                        >
                                          <Button
                                            variant={
                                              simulation.is_completed ||
                                              !simulation.is_started
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
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center p-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg">
            Non ci sono ancora simulazioni disponibili.
          </p>
        </div>
      )}
    </div>
  );
}
