import { db } from "@/db/drizzle";
import { simulationsTable, completedSimulationsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import SimulationClient from "./client";
import { cache } from "react";

// Cache simulation details - these change very infrequently
const getSimulation = cache(async (id: string) => {
  const simulation = await db
    .select()
    .from(simulationsTable)
    .where(eq(simulationsTable.id, id));

  return simulation.length > 0 ? simulation[0] : null;
});

// Set revalidation period
export const revalidate = 3600;

export default async function SimulationPage({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/api/auth/login");
  }

  const simulationId = params.id;
  const simulation = await getSimulation(simulationId);

  if (!simulation) {
    notFound();
  }

  // Check if user has already started this simulation
  const completedSimulation = await db
    .select({
      id: completedSimulationsTable.id,
      started_at: completedSimulationsTable.started_at,
      completed_at: completedSimulationsTable.completed_at,
    })
    .from(completedSimulationsTable)
    .where(
      and(
        eq(completedSimulationsTable.user_id, user.id as string),
        eq(completedSimulationsTable.simulation_id, simulationId)
      )
    )
    .orderBy(desc(completedSimulationsTable.started_at));

  const hasStarted = completedSimulation.length > 0;
  const isCompleted =
    hasStarted && completedSimulation[0].completed_at !== null;

  // Format the date to ISO string for passing to client component
  const startedAt = hasStarted
    ? completedSimulation[0].started_at?.toISOString()
    : null;

  return (
    <SimulationClient
      simulation={simulation}
      userId={user.id as string}
      hasStarted={hasStarted}
      isCompleted={isCompleted}
      completedSimulationId={hasStarted ? completedSimulation[0].id : null}
      startedAt={startedAt}
    />
  );
}
