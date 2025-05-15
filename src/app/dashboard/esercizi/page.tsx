import { redirect } from "next/navigation";
import { Suspense } from "react";
import ExercisesPage from "@/app/components/esercizi/ExerciseCards";
import { getExercisesData } from "@/utils/exercise-data";
import { getTopicsWithSubtopics } from "@/utils/topics-subtopics";
import { ExercisesSkeleton } from "@/app/components/shared/loading";
import { auth } from "@/lib/auth";

// Set revalidation period
export const revalidate = 3600;

export default function EserciziPage() {
  return (
    <Suspense fallback={<ExercisesSkeleton />}>
      <ExercisesContent />
    </Suspense>
  );
}

async function ExercisesContent() {
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

  // Get exercise data - this will return either a redirect to the first topic
  // or indicate that there are no topics available
  const exercisesData = await getExercisesData();

  // If there's a first topic, redirect to it
  if (exercisesData.firstTopic) {
    redirect(`/dashboard/esercizi/${exercisesData.firstTopic}`);
  }

  // If we reach here, there are no topics available
  // Get all topics with their subtopics to pass to our component
  const topicsWithSubtopics = await getTopicsWithSubtopics();

  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold mb-4">Non sono presenti esercizi</h1>
      <p>Per ora non sono presenti esercizi. Per favore, torna più tardi.</p>
    </div>
  );
}
