import { db } from "@/db/drizzle";
import { simulationsTable, completedSimulationsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import SimulationClient from "./client";
import { cache, Suspense } from "react";
import { LoadingSpinner } from "@/app/components/shared/loading/loading-spinner";

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

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
export default async function SimulationPage(props: any) {
  // Properly await the params
  const params = await props.params;
  const simulationId = params.id;
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    redirect("/api/auth/signin");
  }

  const simulationData = await getSimulation(simulationId);

  if (!simulationData) {
    notFound();
  }

  // Adapt the data to match the Simulation interface
  const simulation = {
    id: simulationData.id,
    title: simulationData.title,
    description: simulationData.description,
    pdf_url: simulationData.pdf_url,
    year: 2023, // Default value
    subject: "Matematica", // Default value
    time_in_min: simulationData.time_in_min,
    is_complete: simulationData.is_complete,
  };

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
    <Suspense fallback={<LoadingSpinner text="Caricamento simulazione..." />}>
      <SimulationClient
        simulation={simulation}
        userId={user.id as string}
        hasStarted={hasStarted}
        isCompleted={isCompleted}
        completedSimulationId={hasStarted ? completedSimulation[0].id : null}
        startedAt={startedAt}
      />
    </Suspense>
  );
}
