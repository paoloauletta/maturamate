import { db } from "@/db/drizzle";
import {
  simulationsTable,
  completedSimulationsTable,
  flaggedSimulationsTable,
  simulationsCardsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import ClientSimulationsPage from "./client-page";
import { Suspense } from "react";
import { cache } from "react";

// Cache simulations and cards data - these change very infrequently
const getSimulationData = cache(async () => {
  // Get all simulation cards
  const cards = await db
    .select()
    .from(simulationsCardsTable)
    .orderBy(simulationsCardsTable.year, simulationsCardsTable.title);

  // Get all simulations
  const simulations = await db
    .select()
    .from(simulationsTable)
    .orderBy(simulationsTable.title);

  return { cards, simulations };
});

// Set revalidation period
export const revalidate = 3600;

export default async function Simulations() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return null;
  }

  // Fetch all simulations and cards
  const { cards, simulations } = await getSimulationData();

  // Get user's completed simulations
  const completedSimulations = await db
    .select({
      simulation_id: completedSimulationsTable.simulation_id,
      completed_at: completedSimulationsTable.completed_at,
      started_at: completedSimulationsTable.started_at,
    })
    .from(completedSimulationsTable)
    .where(eq(completedSimulationsTable.user_id, user.id));

  // Get user's flagged (favorited) simulations
  const flaggedSimulations = await db
    .select({
      simulation_id: flaggedSimulationsTable.simulation_id,
    })
    .from(flaggedSimulationsTable)
    .where(eq(flaggedSimulationsTable.user_id, user.id));

  // Create maps for completed, started, and flagged simulations
  const completedSimulationMap = {} as Record<string, boolean>;
  const startedSimulationMap = {} as Record<string, boolean>;
  const flaggedSimulationMap = {} as Record<string, boolean>;

  completedSimulations.forEach((sim) => {
    if (sim.simulation_id) {
      // Mark as completed if completed_at is not null
      if (sim.completed_at !== null) {
        completedSimulationMap[sim.simulation_id] = true;
      }

      // Mark as started but not completed if completed_at is null but started_at is not
      if (sim.completed_at === null && sim.started_at !== null) {
        startedSimulationMap[sim.simulation_id] = true;
      }
    }
  });

  // Mark flagged simulations
  flaggedSimulations.forEach((sim) => {
    if (sim.simulation_id) {
      flaggedSimulationMap[sim.simulation_id] = true;
    }
  });

  // Add completion status to simulations
  const simulationsWithStatus = simulations.map((sim) => ({
    ...sim,
    is_completed: sim.id ? completedSimulationMap[sim.id] || false : false,
    is_started: sim.id ? startedSimulationMap[sim.id] || false : false,
    is_flagged: sim.id ? flaggedSimulationMap[sim.id] || false : false,
  }));

  // Create a map of simulationsWithStatus by card_id for efficient lookup
  const simulationsByCardId = simulationsWithStatus.reduce((map, sim) => {
    if (sim.card_id) {
      if (!map[sim.card_id]) {
        map[sim.card_id] = [];
      }
      map[sim.card_id].push(sim);
    }
    return map;
  }, {} as Record<string, typeof simulationsWithStatus>);

  // Construct simulation cards with associated simulations
  const simulationCards = cards.map((card) => ({
    ...card,
    simulations:
      card.id && simulationsByCardId[card.id]
        ? simulationsByCardId[card.id]
        : [],
  }));

  // Group simulation cards by year
  const simulationCardsByYear = simulationCards.reduce((acc, card) => {
    if (card.year) {
      if (!acc[card.year]) {
        acc[card.year] = [];
      }
      acc[card.year].push(card);
    }
    return acc;
  }, {} as Record<number, typeof simulationCards>);

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(simulationCardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Suspense fallback={<div>Loading simulations...</div>}>
      <ClientSimulationsPage
        simulationCardsByYear={simulationCardsByYear}
        sortedYears={sortedYears}
        userId={user.id}
      />
    </Suspense>
  );
}
