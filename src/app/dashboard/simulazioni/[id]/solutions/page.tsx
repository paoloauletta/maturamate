import { db } from "@/db/drizzle";
import {
  simulationsTable,
  simulationsSolutionsTable,
  relationSimulationSolutionTable,
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

  // Make sure the solutions match the expected interface
  const solutions = allSolutions.map((sol) => ({
    id: sol.simulations_solutions.id,
    simulation_id: simulationId, // Ensure it's never null
    title: sol.simulations_solutions.title,
    pdf_url: sol.simulations_solutions.pdf_url,
    order_index: sol.relation_simulations_solutions.order_index,
  }));

  return solutions;
});

// Set revalidation period
export const revalidate = 3600;

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
export default async function SimulationSolutionsPage(props: any) {
  const simulationId = props.params?.id;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/api/auth/login");
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

  // Check if user has completed this simulation
  const completedSimulation = await db
    .select()
    .from(completedSimulationsTable)
    .where(
      and(
        eq(completedSimulationsTable.user_id, user.id),
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
