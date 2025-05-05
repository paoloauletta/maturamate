import { db } from "@/db/drizzle";
import {
  exercisesTable,
  topicsTable,
  subtopicsTable,
  exercisesCardsTable,
  completedExercisesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import ClientExercisesPage from "./client-page";
import { redirect } from "next/navigation";
import { getTopics } from "@/utils/cache";
import { Suspense } from "react";
import { LoadingSpinner } from "@/app/components/loading/loading-spinner";

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

export default async function Exercises() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin");
    return null;
  }

  // Fetch all topics ordered by order_index using the cached function
  const topics = await getTopics();

  // If there are topics, redirect to the first one
  if (topics.length > 0) {
    redirect(`/dashboard/esercizi/${topics[0].id}`);
  }

  // If no topics are available,a message
  return (
    <Suspense fallback={<LoadingSpinner text="Caricamento esercizi..." />}>
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
    </Suspense>
  );
}
