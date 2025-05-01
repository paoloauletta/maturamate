import { db } from "@/db/drizzle";
import {
  exercisesTable,
  topicsTable,
  subtopicsTable,
  exercisesCardsTable,
  completedExercisesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import ClientExercisesPage from "./client-page";

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

export default async function Exercises() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Fetch all topics with their subtopics
  const topics = await db
    .select({
      id: topicsTable.id,
      name: topicsTable.name,
      description: topicsTable.description,
      order_index: topicsTable.order_index,
    })
    .from(topicsTable)
    .orderBy(topicsTable.order_index);

  // Fetch all subtopics
  const subtopics = await db
    .select({
      id: subtopicsTable.id,
      topic_id: subtopicsTable.topic_id,
      name: subtopicsTable.name,
      order_index: subtopicsTable.order_index,
    })
    .from(subtopicsTable)
    .orderBy(subtopicsTable.order_index);

  // Build the nested structure for the sidebar
  const topicsWithSubtopics = topics.map((topic) => ({
    ...topic,
    subtopics: subtopics.filter((subtopic) => subtopic.topic_id === topic.id),
  }));

  // We no longer need to track card completions this way
  // Instead we're directly tracking individual exercise completions

  // Fetch all exercise cards with their subtopics
  const exerciseCards = await db
    .select({
      id: exercisesCardsTable.id,
      subtopic_id: exercisesCardsTable.subtopic_id,
      subtopic_name: subtopicsTable.name,
      topic_name: topicsTable.name,
      topic_id: subtopicsTable.topic_id,
      description: exercisesCardsTable.description,
      difficulty: exercisesCardsTable.difficulty,
      created_at: exercisesCardsTable.created_at,
      topic_order: topicsTable.order_index,
      subtopic_order: subtopicsTable.order_index,
    })
    .from(exercisesCardsTable)
    .leftJoin(
      subtopicsTable,
      eq(exercisesCardsTable.subtopic_id, subtopicsTable.id)
    )
    .leftJoin(topicsTable, eq(subtopicsTable.topic_id, topicsTable.id))
    .orderBy(topicsTable.order_index, subtopicsTable.order_index);

  // We'll now use a more efficient approach to count and track exercises
  // So we don't need to do the separate counting anymore

  // First, get all exercises grouped by card
  const allExercises = await db
    .select({
      id: exercisesTable.id,
      exercise_card_id: exercisesTable.exercise_card_id,
    })
    .from(exercisesTable);

  // Group exercises by card ID
  const exercisesByCard = allExercises.reduce((acc, exercise) => {
    if (!exercise.exercise_card_id) return acc;

    if (!acc[exercise.exercise_card_id]) {
      acc[exercise.exercise_card_id] = [];
    }
    acc[exercise.exercise_card_id].push(exercise.id);
    return acc;
  }, {} as Record<string, string[]>);

  // Get all completed exercises for this user that were marked as correct
  const completedExercises = await db
    .select({
      exercise_id: completedExercisesTable.exercise_id,
      is_correct: completedExercisesTable.is_correct,
    })
    .from(completedExercisesTable)
    .where(eq(completedExercisesTable.user_id, user.id as string));

  // Filter to only correct exercises and create a set for faster lookups
  const correctExercises = new Set(
    completedExercises
      .filter((ex) => ex.is_correct && ex.exercise_id)
      .map((ex) => ex.exercise_id)
  );

  // Calculate completed count for each card
  const completedExercisesMap: Record<
    string,
    { completedCount: number; totalCount: number }
  > = {};

  Object.entries(exercisesByCard).forEach(([cardId, exerciseIds]) => {
    const totalCount = exerciseIds.length;
    const completedCount = exerciseIds.filter((id) =>
      correctExercises.has(id)
    ).length;

    completedExercisesMap[cardId] = {
      completedCount,
      totalCount,
    };
  });

  // Group exercise cards by topic and subtopic for display, and add completion info manually
  const exerciseCardsByTopic = exerciseCards.reduce((acc, card) => {
    const topicId = card.topic_id || "uncategorized";
    const subtopicId = card.subtopic_id || "uncategorized";

    if (!acc[topicId]) {
      acc[topicId] = {
        topic_name: card.topic_name || "Esercizi non categorizzati",
        topic_order: card.topic_order || null,
        subtopics: {},
      };
    }

    if (!acc[topicId].subtopics[subtopicId]) {
      acc[topicId].subtopics[subtopicId] = {
        subtopic_name: card.subtopic_name || "Esercizi non categorizzati",
        subtopic_order: card.subtopic_order || null,
        exercise_cards: [],
      };
    }

    // Get completion data from our maps
    const completedData = completedExercisesMap[card.id] || {
      completedCount: 0,
      totalCount: 0,
    };
    // Card is completed if all exercises are completed correctly
    const isCompleted =
      completedData.completedCount > 0 &&
      completedData.completedCount === completedData.totalCount;

    acc[topicId].subtopics[subtopicId].exercise_cards.push({
      ...card,
      is_completed: isCompleted,
      score: completedData.completedCount, // Now we use the actual completed count
      total_exercises: completedData.totalCount || 0,
    });

    return acc;
  }, {} as Record<string, TopicGroup>);

  // Pass data to client component
  return (
    <ClientExercisesPage
      topicsWithSubtopics={topicsWithSubtopics}
      exerciseCardsByTopic={exerciseCardsByTopic}
    />
  );
}
