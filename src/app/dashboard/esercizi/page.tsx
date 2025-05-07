import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getExercisesData } from "./exercises-data-server";
import { ExercisesSkeleton } from "@/components/loading";

// Define interfaces for your data structure
interface ExerciseCard {
  id: string;
  subtopic_id: string | null;
  subtopic_name: string | null;
  topic_name: string | null;
  topic_id: string | null;
  description: string;
  difficulty: number;
  created_at: Date;
  topic_order: number | null;
  subtopic_order: number | null;
  is_completed: boolean;
  score: number;
  total_exercises: number;
}

interface SubtopicGroup {
  subtopic_name: string;
  subtopic_order: number | null;
  exercise_cards: ExerciseCard[];
}

interface TopicGroup {
  topic_name: string;
  topic_order: number | null;
  subtopics: Record<string, SubtopicGroup>;
}

// Set revalidation period
export const revalidate = 3600;

export default function ExercisesPage() {
  return (
    <Suspense fallback={<ExercisesSkeleton />}>
      <ExercisesContent />
    </Suspense>
  );
}

async function ExercisesContent() {
  const exercisesData = await getExercisesData();

  // If there's a first topic, redirect to it
  if (exercisesData.firstTopic) {
    redirect(`/dashboard/esercizi/${exercisesData.firstTopic}`);
  }

  // If no topics are available, display message
  return (
    <div>
      <h1 className="text-4xl font-bold text-left mb-8 border-b pb-4 border-border">
        Esercizi
      </h1>
      <div className="text-center p-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-lg">
          Non ci sono ancora esercizi disponibili.
        </p>
      </div>
    </div>
  );
}
