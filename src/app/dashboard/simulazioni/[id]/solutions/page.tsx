import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/app/components/shared/loading/loading-spinner";
import { auth } from "@/lib/auth";
import {
  getSimulation,
  getSolutions,
  getCompletedSimulation,
} from "@/utils/simulations-data";
import { Simulation } from "@/types/simulationsTypes";
import SimulationSolutions from "@/app/components/simulations/simulation-solutions";

// Set revalidation period
export const revalidate = 3600;

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
export default async function SimulationSolutionsPage(props: any) {
  // Properly await the params
  const params = await props.params;
  const simulationId = params.id;
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    redirect("/api/auth/login");
  }

  const simulationData = await getSimulation(simulationId);

  if (!simulationData) {
    notFound();
  }

  // Adapt the data to match the Simulation interface
  const simulation: Simulation = {
    id: simulationData.id,
    title: simulationData.title,
    description: simulationData.description,
    pdf_url: simulationData.pdf_url,
    year: 2023, // Default value
    subject: "Matematica", // Default value
    time_in_min: simulationData.time_in_min,
    is_complete: simulationData.is_complete,
    card_id: simulationData.card_id,
  };

  // Check if user has completed this simulation
  const { isCompleted } = await getCompletedSimulation(user.id, simulationId);

  // If the user hasn't completed the simulation, redirect to the simulation page
  if (!isCompleted) {
    redirect(`/dashboard/simulazioni/${simulationId}`);
  }

  // Get solutions for this simulation
  const solutions = await getSolutions(simulationId);

  return (
    <Suspense fallback={<LoadingSpinner text="Caricamento soluzioni..." />}>
      <SimulationSolutions simulation={simulation} solutions={solutions} />
    </Suspense>
  );
}
