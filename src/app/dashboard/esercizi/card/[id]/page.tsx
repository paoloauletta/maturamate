import { db } from "@/db/drizzle";
import { exercisesTable, completedExercisesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import ExerciseCardClient from "./ExerciseCardClient";
import { getExerciseCardDetails, getExercisesForCard } from "@/utils/cache";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Cache common exercise card data - not user specific
const getCachedCardData = unstable_cache(
  async (cardId: string) => {
    return getExerciseCardDetails(cardId);
  },
  ["exercise-card-data"],
  { revalidate: 3600 }
);

// Cache exercise questions - not user specific
const getCachedExercises = unstable_cache(
  async (cardId: string) => {
    return getExercisesForCard(cardId);
  },
  ["exercise-card-questions"],
  { revalidate: 3600 }
);

interface ContentData {
  text?: string;
  html?: string;
  [key: string]: unknown; // Allow for other properties
}

// Type for content that can be either a string, an array of strings, or an object with specific properties
type ContentType = string | string[] | ContentData;

interface Exercise {
  id: string;
  question_data: ContentType;
  solution_data: ContentType;
  order_index: number;
}

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
async function ExerciseCardPage(props: any) {
  // Properly await the params
  const params = await props.params;
  const id = params.id;

  if (!id) {
    notFound();
    return null;
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Fetch the exercise card details using cached function
  const card = await getCachedCardData(id);

  if (!card) {
    notFound();
  }

  // Fetch all exercises for this card using cached function
  const exercisesFromDb = await getCachedExercises(id);

  // Transform the database results to match the Exercise type
  const exercises: Exercise[] = exercisesFromDb.map((exercise) => {
    let parsedQuestionData: ContentType;
    let parsedSolutionData: ContentType;

    // Parse question_data based on its type
    if (typeof exercise.question_data === "string") {
      try {
        // Try to parse as JSON if it looks like JSON
        if (
          exercise.question_data.startsWith("[") ||
          exercise.question_data.startsWith("{")
        ) {
          parsedQuestionData = JSON.parse(exercise.question_data);
        } else {
          parsedQuestionData = exercise.question_data;
        }
      } catch {
        // If parsing fails, just use the string
        parsedQuestionData = exercise.question_data;
      }
    } else {
      // If it's already an object, just use it
      parsedQuestionData = exercise.question_data as ContentType;
    }

    // Parse solution_data based on its type
    if (typeof exercise.solution_data === "string") {
      try {
        // Try to parse as JSON if it looks like JSON
        if (
          exercise.solution_data.startsWith("[") ||
          exercise.solution_data.startsWith("{")
        ) {
          parsedSolutionData = JSON.parse(exercise.solution_data);
        } else {
          parsedSolutionData = exercise.solution_data;
        }
      } catch {
        // If parsing fails, just use the string
        parsedSolutionData = exercise.solution_data;
      }
    } else {
      // If it's already an object, just use it
      parsedSolutionData = exercise.solution_data as ContentType;
    }

    return {
      id: exercise.id,
      question_data: parsedQuestionData,
      solution_data: parsedSolutionData,
      order_index: exercise.order_index ?? 0,
    };
  });

  // Get completed exercises for this user - NOT cached as it's user-specific
  const completedExercises = await db
    .select({
      exercise_id: completedExercisesTable.exercise_id,
      is_correct: completedExercisesTable.is_correct,
      attempt: completedExercisesTable.attempt,
      created_at: completedExercisesTable.created_at,
    })
    .from(completedExercisesTable)
    .where(and(eq(completedExercisesTable.user_id, user.id as string)));

  // First group by exercise_id to get all attempts for each exercise
  const exerciseAttemptsMap: Record<
    string,
    { is_correct: boolean; attempt: number; created_at: Date }[]
  > = {};
  completedExercises.forEach((attempt) => {
    if (attempt.exercise_id) {
      if (!exerciseAttemptsMap[attempt.exercise_id]) {
        exerciseAttemptsMap[attempt.exercise_id] = [];
      }
      exerciseAttemptsMap[attempt.exercise_id].push({
        is_correct: attempt.is_correct,
        attempt: attempt.attempt,
        created_at: attempt.created_at,
      });
    }
  });

  // Then, for each exercise, get the latest attempt
  const completedExercisesMap: Record<
    string,
    { isCorrect: boolean; attempts: number }
  > = {};
  Object.entries(exerciseAttemptsMap).forEach(([exerciseId, attempts]) => {
    // Only include exercises that are part of this card
    if (exercises.some((e) => e.id === exerciseId)) {
      // Sort attempts by created_at (newest first)
      const sortedAttempts = [...attempts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Get latest attempt
      const latestAttempt = sortedAttempts[0];
      completedExercisesMap[exerciseId] = {
        isCorrect: latestAttempt.is_correct,
        attempts: Math.max(...attempts.map((a) => a.attempt)),
      };
    }
  });

  return (
    <Suspense fallback={<LoadingSpinner text="Caricamento esercizi..." />}>
      <ExerciseCardClient
        id={card.id}
        description={card.description || ""}
        difficulty={card.difficulty}
        topicId={card.topic_id || ""}
        topicName={card.topic_name || ""}
        subtopicId={card.subtopic_id || ""}
        subtopicName={card.subtopic_name || ""}
        exercises={exercises}
        completedExercises={completedExercisesMap}
      />
    </Suspense>
  );
}

// Export with the 'any' type to bypass Next.js type constraints
export default ExerciseCardPage;
