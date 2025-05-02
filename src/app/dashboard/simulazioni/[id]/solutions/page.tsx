import { db } from "@/db/drizzle";
import {
  simulationsTable,
  simulationsSolutionsTable,
  completedSimulationsTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import SolutionsClient from "./client";
import { cache } from "react";

// Cache simulation details - these change very infrequently
const getSimulation = cache(async (id: string) => {
  const simulation = await db
    .select()
    .from(simulationsTable)
    .where(eq(simulationsTable.id, id));

  return simulation.length > 0 ? simulation[0] : null;
});

// Cache solutions - these change very infrequently
const getSolutions = cache(async (simulationId: string) => {
  return db
    .select()
    .from(simulationsSolutionsTable)
    .where(eq(simulationsSolutionsTable.simulation_id, simulationId))
    .orderBy(simulationsSolutionsTable.order_index);
});

// Set revalidation period
export const revalidate = 3600;

export default async function SolutionsPage({
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

  // Check if user has completed this simulation
  const completedSimulation = await db
    .select()
    .from(completedSimulationsTable)
    .where(
      and(
        eq(completedSimulationsTable.user_id, user.id as string),
        eq(completedSimulationsTable.simulation_id, simulationId)
      )
    );

  const hasCompleted =
    completedSimulation.length > 0 &&
    completedSimulation[0].completed_at !== null;

  // If the user hasn't completed the simulation, redirect to the simulation page
  if (!hasCompleted) {
    redirect(`/dashboard/simulazioni/${simulationId}`);
  }

  // Get solutions for this simulation
  const solutions = await getSolutions(simulationId);

  return <SolutionsClient simulation={simulation} solutions={solutions} />;
}
