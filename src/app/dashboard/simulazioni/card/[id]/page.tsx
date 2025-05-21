import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SimulationsSkeleton } from "@/app/components/shared/loading/skeletons/simulations-skeleton";
import { auth } from "@/lib/auth";
import { getSimulationCardWithSimulations } from "@/utils/simulations-data";
import SimulationCardDetailPage from "@/app/components/simulations/simulation-card-detail";

interface SimulationCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SimulationCardPage({
  params,
}: SimulationCardPageProps) {
  // Extract the ID from params properly
  const { id: cardId } = await params;

  return (
    <Suspense fallback={<SimulationsSkeleton />}>
      <SimulationCardContent cardId={cardId} />
    </Suspense>
  );
}

async function SimulationCardContent({ cardId }: { cardId: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Accesso negato</h2>
        <p>Devi effettuare il login per accedere a questa pagina.</p>
      </div>
    );
  }

  // Get all required data for the simulation card detail page
  const cardData = await getSimulationCardWithSimulations(cardId, userId);

  if (!cardData) {
    notFound();
  }

  return <SimulationCardDetailPage card={cardData} userId={userId} />;
}
