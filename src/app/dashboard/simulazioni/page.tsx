import { db } from "@/db/drizzle";
import { simulationsTable, completedSimulationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import ClientSimulationsPage from "./client-page";
import { Suspense } from "react";
import { cache } from "react";

// Cache simulations data - these change very infrequently
const getSimulations = cache(async () => {
  return db
    .select()
    .from(simulationsTable)
    .orderBy(simulationsTable.year, simulationsTable.title);
});

// Set revalidation period
export const revalidate = 3600;

export default async function Simulations() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Fetch all simulations
  const simulations = await getSimulations();

  // Get user's completed simulations
  const completedSimulations = await db
    .select({
      simulation_id: completedSimulationsTable.simulation_id,
      completed_at: completedSimulationsTable.completed_at,
      started_at: completedSimulationsTable.started_at,
    })
    .from(completedSimulationsTable)
    .where(eq(completedSimulationsTable.user_id, user.id as string));

  // Create maps for completed and started simulations
  const completedSimulationMap = {} as Record<string, boolean>;
  const startedSimulationMap = {} as Record<string, boolean>;

  completedSimulations.forEach((sim) => {
    // Mark as completed if completed_at is not null
    if (sim.completed_at !== null) {
      completedSimulationMap[sim.simulation_id] = true;
    }

    // Mark as started but not completed if completed_at is null but started_at is not
    if (sim.completed_at === null && sim.started_at !== null) {
      startedSimulationMap[sim.simulation_id] = true;
    }
  });

  // Add completion status to simulations
  const simulationsWithStatus = simulations.map((sim) => ({
    ...sim,
    is_completed: completedSimulationMap[sim.id] || false,
    is_started: startedSimulationMap[sim.id] || false,
  }));

  // Group simulations by year
  const simulationsByYear = simulationsWithStatus.reduce((acc, simulation) => {
    if (!acc[simulation.year]) {
      acc[simulation.year] = [];
    }
    acc[simulation.year].push(simulation);
    return acc;
  }, {} as Record<number, typeof simulationsWithStatus>);

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(simulationsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Suspense fallback={<div>Loading simulations...</div>}>
      <ClientSimulationsPage
        simulationsByYear={simulationsByYear}
        sortedYears={sortedYears}
        userId={user.id as string}
      />
    </Suspense>
  );
}
