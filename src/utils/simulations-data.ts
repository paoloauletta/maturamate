import { db } from "@/db/drizzle";
import {
  simulationsTable,
  simulationsCardsTable,
  completedSimulationsTable,
  flaggedSimulationsTable,
  simulationsSolutionsTable,
  relationSimulationSolutionTable,
} from "@/db/schema";
import { eq, and, isNull, isNotNull, desc } from "drizzle-orm";
import { cache } from "react";
import { Simulation, Solution } from "@/types/simulationsTypes";

// Cache simulations and cards data - these change very infrequently
export const getSimulationData = cache(async () => {
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

// Get user's completed and flagged simulations
export async function getUserSimulationStatus(userId: string) {
  // Get user's completed simulations
  const completedSimulations = await db
    .select({
      simulation_id: completedSimulationsTable.simulation_id,
      completed_at: completedSimulationsTable.completed_at,
      started_at: completedSimulationsTable.started_at,
    })
    .from(completedSimulationsTable)
    .where(eq(completedSimulationsTable.user_id, userId));

  // Get user's flagged (favorited) simulations
  const flaggedSimulations = await db
    .select({
      simulation_id: flaggedSimulationsTable.simulation_id,
    })
    .from(flaggedSimulationsTable)
    .where(eq(flaggedSimulationsTable.user_id, userId));

  // Create maps for completed, started, and flagged simulations
  const completedSimulationMap: Record<string, boolean> = {};
  const startedSimulationMap: Record<string, boolean> = {};
  const flaggedSimulationMap: Record<string, boolean> = {};

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

  return {
    completedSimulationMap,
    startedSimulationMap,
    flaggedSimulationMap,
  };
}

// Get a single simulation by ID
export const getSimulation = cache(
  async (id: string): Promise<Simulation | null> => {
    const simulation = await db
      .select()
      .from(simulationsTable)
      .where(eq(simulationsTable.id, id));

    return simulation.length > 0 ? simulation[0] : null;
  }
);

// Get a completed simulation entry for a user and simulation
export async function getCompletedSimulation(
  userId: string,
  simulationId: string
) {
  const completedSimulation = await db
    .select({
      id: completedSimulationsTable.id,
      started_at: completedSimulationsTable.started_at,
      completed_at: completedSimulationsTable.completed_at,
    })
    .from(completedSimulationsTable)
    .where(
      and(
        eq(completedSimulationsTable.user_id, userId),
        eq(completedSimulationsTable.simulation_id, simulationId)
      )
    )
    .orderBy(desc(completedSimulationsTable.started_at));

  const hasStarted = completedSimulation.length > 0;
  const isCompleted =
    hasStarted && completedSimulation[0].completed_at !== null;

  // Format date for client component
  const startedAt = hasStarted
    ? completedSimulation[0].started_at?.toISOString()
    : null;

  return {
    hasStarted,
    isCompleted,
    completedSimulationId: hasStarted ? completedSimulation[0].id : null,
    startedAt,
  };
}

// Get solutions for a simulation
export const getSolutions = cache(
  async (simulationId: string): Promise<Solution[]> => {
    // Get solutions
    const allSolutions = await db
      .select()
      .from(simulationsSolutionsTable)
      .innerJoin(
        relationSimulationSolutionTable,
        eq(
          simulationsSolutionsTable.id,
          relationSimulationSolutionTable.solution_id
        )
      )
      .where(eq(relationSimulationSolutionTable.simulation_id, simulationId))
      .orderBy(relationSimulationSolutionTable.order_index);

    // Map to the expected Solution interface
    return allSolutions.map((sol) => ({
      id: sol.simulations_solutions.id,
      simulation_id: simulationId,
      title: sol.simulations_solutions.title,
      pdf_url: sol.simulations_solutions.pdf_url,
      order_index: sol.relation_simulations_solutions.order_index,
    }));
  }
);
