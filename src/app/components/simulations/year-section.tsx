"use client";

import { SimulationCard } from "@/types/simulationsTypes";
import SimulationCardComponent from "./simulation-card";

interface YearSectionProps {
  year: number;
  simulationCards: SimulationCard[];
  onToggleFavorite: (
    simulationId: string,
    e: React.MouseEvent
  ) => Promise<void>;
}

export default function YearSection({
  year,
  simulationCards,
  onToggleFavorite,
}: YearSectionProps) {
  if (simulationCards.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-semibold mb-6 text-foreground/95 border-b border-muted pb-2">
        Simulazioni {year}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {simulationCards.map((card) => (
          <SimulationCardComponent
            key={card.id}
            card={card}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
