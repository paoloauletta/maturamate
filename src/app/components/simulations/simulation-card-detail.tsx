"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SimulationCard } from "@/types/simulationsTypes";
import SimulationItem from "./card-item";

interface SimulationCardDetailProps {
  card: SimulationCard;
  userId: string;
}

export default function SimulationCardDetailPage({
  card,
  userId,
}: SimulationCardDetailProps) {
  const router = useRouter();
  const [flaggingSimulationId, setFlaggingSimulationId] = useState<
    string | null
  >(null);

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

  // Toggle simulation favorite status
  const toggleFavorite = async (simulationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Set flagging status
    setFlaggingSimulationId(simulationId);

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
        const updatedCard = {
          ...card,
          simulations: card.simulations.map((sim) => {
            if (sim.id === simulationId) {
              return { ...sim, is_flagged: !sim.is_flagged };
            }
            return sim;
          }),
        };

        // Force a refresh to get the updated data
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling simulation favorite:", error);
    } finally {
      setFlaggingSimulationId(null);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="w-full max-w-3xl px-4">
        {/* Back link */}
        <Link href="/dashboard/simulazioni">
          <div className="text-muted-foreground items-center w-fit gap-1 mb-4 flex flex-row hover:text-foreground transition-all">
            <ArrowLeft className="h-4 w-4" />
            <span>Torna alle simulazioni</span>
          </div>
        </Link>

        {/* Unified Card Info + Simulations */}
        <div className="border border-border bg-card/80 rounded-xl p-6 flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">{card.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-base text-muted-foreground">
              <span>{card.subject}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{card.year}</span>
            </div>
            {card.description && (
              <p className="mt-3 text-muted-foreground text-sm">
                {card.description}
              </p>
            )}
          </div>
          <div>
            <div className="font-medium mb-2 text-lg">
              Simulazioni disponibili
            </div>
            <div className="flex flex-col gap-4">
              {card.simulations.length > 0 ? (
                card.simulations.map((simulation, index) => (
                  <SimulationItem
                    key={simulation.id}
                    simulation={simulation}
                    index={index}
                    onToggleFavorite={toggleFavorite}
                    formatTimeInHours={formatTimeInHours}
                  />
                ))
              ) : (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-lg">
                    Non ci sono simulazioni disponibili per questa scheda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
