import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { LoadingSpinner } from "@/app/components/shared/loading/loading-spinner";
import {
  getSimulation,
  getCompletedSimulation,
} from "@/utils/simulations-data";
import { Simulation } from "@/types/simulationsTypes";
import SimulationView from "@/app/components/simulations/simulation-view";

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
  const simulation: Simulation = {
    id: simulationData.id,
    title: simulationData.title,
    description: simulationData.description,
    pdf_url: simulationData.pdf_url,
    time_in_min: simulationData.time_in_min,
    is_complete: simulationData.is_complete,
    card_id: simulationData.card_id,
  };

  // Get user's simulation status
  const { hasStarted, isCompleted, completedSimulationId, startedAt } =
    await getCompletedSimulation(user.id, simulationId);

  return (
    <Suspense fallback={<LoadingSpinner text="Caricamento simulazione..." />}>
      <SimulationView
        simulation={simulation}
        userId={user.id as string}
        hasStarted={hasStarted}
        isCompleted={isCompleted}
        completedSimulationId={completedSimulationId}
        startedAt={startedAt}
      />
    </Suspense>
  );
}
