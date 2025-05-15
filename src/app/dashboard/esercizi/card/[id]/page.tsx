import { notFound } from "next/navigation";
import CardDetailPage from "@/app/components/esercizi/SinlgeExerciseCard";
import { Suspense } from "react";
import { ExercisesSkeleton } from "@/app/components/shared/loading";
import { auth } from "@/lib/auth";
import { getExerciseCardData } from "@/utils/exercise-data";

interface ExerciseCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExerciseCardPage({
  params,
}: ExerciseCardPageProps) {
  // Extract the ID from params properly
  const { id: cardId } = await params;

  return (
    <Suspense fallback={<ExercisesSkeleton />}>
      <ExerciseCardContent cardId={cardId} />
    </Suspense>
  );
}

async function ExerciseCardContent({ cardId }: { cardId: string }) {
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

  // Get all required data for the card detail page
  const cardData = await getExerciseCardData(cardId, userId);

  if (!cardData) {
    notFound();
  }

  const { card, exercises, completedExercises, flaggedExercises } = cardData;

  return (
    <CardDetailPage
      id={card.id}
      description={card.description}
      difficulty={card.difficulty}
      topicId={card.topicId}
      topicName={card.topicName}
      subtopicId={card.subtopicId}
      subtopicName={card.subtopicName}
      exercises={exercises}
      completedExercises={completedExercises}
      flaggedExercises={flaggedExercises}
      card={card}
    />
  );
}
