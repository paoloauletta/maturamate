import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { PageLoading } from "@/app/components/shared/loading/page-loading.server";
import { SimulationsSkeleton } from "@/app/components/shared/loading";
import {
  getSimulationData,
  getUserSimulationStatus,
} from "@/utils/simulations-data";
import { UserSimulation, SimulationCard } from "@/types/simulationsTypes";
import SimulationsPage from "@/app/components/simulations/simulations-page";

// Set revalidation period
export const revalidate = 3600;

export default function SimulationsWrapper() {
  return (
    <Suspense fallback={<SimulationsSkeleton />}>
      <Simulations />
    </Suspense>
  );
}

async function Simulations() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    return null;
  }

  // Fetch all simulations and cards
  const { cards, simulations } = await getSimulationData();

  // Get user's simulation status (completed, started, flagged)
  const { completedSimulationMap, startedSimulationMap, flaggedSimulationMap } =
    await getUserSimulationStatus(user.id);

  // Add completion status to simulations
  const simulationsWithStatus = simulations.map((sim) => ({
    ...sim,
    is_completed: sim.id ? completedSimulationMap[sim.id] || false : false,
    is_started: sim.id ? startedSimulationMap[sim.id] || false : false,
    is_flagged: sim.id ? flaggedSimulationMap[sim.id] || false : false,
  })) as UserSimulation[];

  // Create a map of simulationsWithStatus by card_id for efficient lookup
  const simulationsByCardId = simulationsWithStatus.reduce((map, sim) => {
    if (sim.card_id) {
      if (!map[sim.card_id]) {
        map[sim.card_id] = [];
      }
      map[sim.card_id].push(sim);
    }
    return map;
  }, {} as Record<string, UserSimulation[]>);

  // Construct simulation cards with associated simulations
  const simulationCards = cards.map((card) => ({
    ...card,
    simulations:
      card.id && simulationsByCardId[card.id]
        ? simulationsByCardId[card.id]
        : [],
  })) as SimulationCard[];

  // Group simulation cards by year
  const simulationCardsByYear = simulationCards.reduce((acc, card) => {
    if (card.year) {
      if (!acc[card.year]) {
        acc[card.year] = [];
      }
      acc[card.year].push(card);
    }
    return acc;
  }, {} as Record<number, SimulationCard[]>);

  // Sort cards within each year by order_index
  Object.keys(simulationCardsByYear).forEach((yearKey) => {
    const year = Number(yearKey);
    simulationCardsByYear[year].sort((a, b) => {
      // If order_index is null, place at the end
      if (a.order_index === null && b.order_index === null) return 0;
      if (a.order_index === null) return 1;
      if (b.order_index === null) return -1;
      return a.order_index - b.order_index;
    });
  });

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(simulationCardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <PageLoading loadingText="Caricamento simulazioni...">
      <SimulationsPage
        simulationCardsByYear={simulationCardsByYear}
        sortedYears={sortedYears}
        userId={user.id}
      />
    </PageLoading>
  );
}
