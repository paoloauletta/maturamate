"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Calendar,
  School,
  Star,
  CircleDot,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="container">
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <h1 className="text-4xl font-bold">Simulazioni</h1>

        <div className="flex items-center gap-4">
          {/* Subject filter dropdown - to be implemented */}
          <div className="text-sm text-muted-foreground">
            {subjectFilter === "all"
              ? "Tutte le materie"
              : `Materia: ${subjectFilter}`}
          </div>
        </div>
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
              <h2 className="text-2xl font-bold mb-6 text-primary">
                Simulazioni {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
                  <Card key={card.id} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{card.title}</CardTitle>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <School className="h-4 w-4 mr-1" />
                        {card.subject}
                        <span className="mx-2">•</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        {card.year}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {card.description.length > 120
                          ? `${card.description.substring(0, 120)}...`
                          : card.description}
                      </p>

                      <div className="space-y-3 mt-4">
                        {/* List each simulation type for this card */}
                        {card.simulations.map((simulation) => {
                          let simulationType = "Simulazione Completa";
                          let icon = <BookOpen className="h-4 w-4 mr-2" />;

                          if (
                            simulation.title.toLowerCase().includes("problem")
                          ) {
                            simulationType = "Solo Problemi";
                            icon = <CircleDot className="h-4 w-4 mr-2" />;
                          } else if (
                            simulation.title.toLowerCase().includes("quesit")
                          ) {
                            simulationType = "Solo Quesiti";
                            icon = <CircleDot className="h-4 w-4 mr-2" />;
                          }

                          return (
                            <div
                              key={simulation.id}
                              className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  {icon}
                                  <span className="font-medium">
                                    {simulationType}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) =>
                                    toggleFavorite(simulation.id, e)
                                  }
                                  className="focus:outline-none ml-2"
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
                                        : "text-muted-foreground hover:text-yellow-400"
                                    )}
                                  />
                                </button>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatTimeInHours(simulation.time_in_min)}

                                  {simulation.is_completed && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completata
                                    </Badge>
                                  )}
                                </div>

                                <Link
                                  href={`/dashboard/simulazioni/${simulation.id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    {simulation.is_completed
                                      ? "Rivedi"
                                      : simulation.is_started
                                      ? "Continua"
                                      : "Inizia"}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
