"use client";

import { useState } from "react";
import { ClientSimulationsPageProps } from "@/types/simulationsTypes";
import YearSection from "@/app/components/simulations/year-section";

export default function SimulationsPage({
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
  const filterSimulationCards = (cards: typeof allCards) => {
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

  return (
    <div className="">
      <div className="flex justify-between items-center border-b border-border my-4 sm:my-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-left">
          Simulazioni
        </h1>
      </div>

      {sortedYears.length > 0 ? (
        sortedYears.map((year) => {
          const filteredCards = filterSimulationCards(
            localSimulationCards[year]
          );

          return (
            <YearSection
              key={year}
              year={year}
              simulationCards={filteredCards}
              onToggleFavorite={toggleFavorite}
            />
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
