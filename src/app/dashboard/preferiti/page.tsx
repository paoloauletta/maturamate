import { db } from "@/db/drizzle";
import {
  flaggedExercisesTable,
  flaggedExercisesCardsTable,
  exercisesTable,
  exercisesCardsTable,
  subtopicsTable,
  topicsTable,
  completedExercisesTable,
  completedExercisesCardsTable,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";

// Import client component
import FavoritesClient from "./client";
import { type ContentType } from "./client"; // Import ContentType from client
import { FavoritesSkeleton } from "@/app/components/shared/loading";

export default async function FavoritesPageWrapper() {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesPage />
    </Suspense>
  );
}

async function FavoritesPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch flagged exercise cards with details, including completion status
  const flaggedCardsRaw = await db
    .select({
      id: exercisesCardsTable.id,
      description: exercisesCardsTable.description,
      difficulty: exercisesCardsTable.difficulty,
      subtopic_id: exercisesCardsTable.subtopic_id,
      subtopic_name: subtopicsTable.name,
      topic_id: subtopicsTable.topic_id,
      topic_name: topicsTable.name,
      created_at: flaggedExercisesCardsTable.created_at,
    })
    .from(flaggedExercisesCardsTable)
    .innerJoin(
      exercisesCardsTable,
      eq(flaggedExercisesCardsTable.exercise_card_id, exercisesCardsTable.id)
    )
    .leftJoin(
      subtopicsTable,
      eq(exercisesCardsTable.subtopic_id, subtopicsTable.id)
    )
    .leftJoin(topicsTable, eq(subtopicsTable.topic_id, topicsTable.id))
    .where(eq(flaggedExercisesCardsTable.user_id, user.id as string))
    .orderBy(flaggedExercisesCardsTable.created_at);

  // Process each card to get completion information
  const flaggedCardsWithCompletion = await Promise.all(
    flaggedCardsRaw.map(async (card) => {
      // Check if the card is marked as completed
      const completedCard = await db
        .select()
        .from(completedExercisesCardsTable)
        .where(
          and(
            eq(completedExercisesCardsTable.user_id, user.id as string),
            eq(completedExercisesCardsTable.exercise_card_id, card.id)
          )
        )
        .limit(1);

      // Get total exercises in the card
      const exercisesInCard = await db
        .select({
          count: count(),
        })
        .from(exercisesTable)
        .where(eq(exercisesTable.exercise_card_id, card.id));

      const totalExercises = exercisesInCard[0]?.count || 0;

      // If the card is completed, all exercises are done
      if (completedCard.length > 0) {
        return {
          ...card,
          is_completed: true,
          total_exercises: totalExercises,
          completed_exercises: totalExercises,
        };
      }

      // Otherwise, count completed exercises
      const completedExercises = await db
        .select({
          count: count(),
        })
        .from(completedExercisesTable)
        .innerJoin(
          exercisesTable,
          eq(completedExercisesTable.exercise_id, exercisesTable.id)
        )
        .where(
          and(
            eq(completedExercisesTable.user_id, user.id as string),
            eq(exercisesTable.exercise_card_id, card.id),
            eq(completedExercisesTable.is_correct, true)
          )
        );

      return {
        ...card,
        is_completed: false,
        total_exercises: totalExercises,
        completed_exercises: completedExercises[0]?.count || 0,
      };
    })
  );

  // Use the enhanced cards with completion data
  const flaggedCards = flaggedCardsWithCompletion;

  // Fetch flagged individual exercises with details
  const flaggedExercisesRaw = await db
    .select({
      id: exercisesTable.id,
      question_data: exercisesTable.question_data,
      solution_data: exercisesTable.solution_data,
      exercise_card_id: exercisesTable.exercise_card_id,
      created_at: flaggedExercisesTable.created_at,
      card_description: exercisesCardsTable.description,
      difficulty: exercisesCardsTable.difficulty,
      subtopic_id: exercisesCardsTable.subtopic_id,
      subtopic_name: subtopicsTable.name,
      topic_id: subtopicsTable.topic_id,
      topic_name: topicsTable.name,
    })
    .from(flaggedExercisesTable)
    .innerJoin(
      exercisesTable,
      eq(flaggedExercisesTable.exercise_id, exercisesTable.id)
    )
    .leftJoin(
      exercisesCardsTable,
      eq(exercisesTable.exercise_card_id, exercisesCardsTable.id)
    )
    .leftJoin(
      subtopicsTable,
      eq(exercisesCardsTable.subtopic_id, subtopicsTable.id)
    )
    .leftJoin(topicsTable, eq(subtopicsTable.topic_id, topicsTable.id))
    .where(eq(flaggedExercisesTable.user_id, user.id as string))
    .orderBy(flaggedExercisesTable.created_at);

  // Transform the raw results and parse JSON content if needed
  const flaggedExercises = flaggedExercisesRaw.map((exercise) => {
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
      ...exercise,
      question_data: parsedQuestionData,
      solution_data: parsedSolutionData,
      // Ensure non-nullable fields have proper defaults
      card_description: exercise.card_description || "",
      difficulty: exercise.difficulty || 1,
    };
  });

  return (
    <FavoritesClient
      flaggedCards={flaggedCards}
      flaggedExercises={flaggedExercises}
    />
  );
}
