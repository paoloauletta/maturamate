import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ExercisesTopicClient from "./client";
import { getTopicsWithSubtopics, getTopics, getSubtopics } from "@/utils/cache";
import { db } from "@/db/drizzle";
import {
  exercisesCardsTable,
  exercisesTable,
  completedExercisesTable,
} from "@/db/schema";

// Set revalidation period - revalidate every hour
export const revalidate = 3600;

// Generate static params for all topics - this enables static generation
export async function generateStaticParams() {
  const topics = await getTopics();
  return topics.map((topic) => ({ topic: topic.id }));
}

// types.ts
export interface TopicType {
  id: string;
  name: string;
  description: string | null;
  order_index: number | null;
}

export interface SubtopicType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
}

export interface ExerciseCardType {
  id: string;
  subtopic_id: string | null;
  description: string;
  difficulty: number;
  order_index: number | null;
  total_exercises: number;
  completed_exercises: number;
  is_completed: boolean;
}

export interface SubtopicWithExercisesType extends SubtopicType {
  exercise_cards: ExerciseCardType[];
}

export interface TopicWithSubtopicsType extends TopicType {
  subtopics: SubtopicType[];
}

export interface ExerciseTopicClientProps {
  currentTopic: TopicType;
  topicsWithSubtopics: TopicWithSubtopicsType[];
  subtopicsWithExercises: SubtopicWithExercisesType[];
  activeSubtopicId?: string;
  userId: string;
}

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
async function ExercisesTopicPage(props: any) {
  // Extract the params and searchParams safely using await
  const params = await props.params;
  const searchParams = await props.searchParams;
  const topicId = params.topic;
  const subtopicId = searchParams?.subtopic;

  if (!topicId) {
    notFound();
  }

  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    redirect("/api/auth/signin");
  }

  // Fetch the current topic and all topics with subtopics using cached functions
  const allTopics = await getTopics();
  const topic = allTopics.filter((t) => t.id === topicId);

  if (topic.length === 0) {
    return notFound();
  }

  // Get topics with subtopics using the cached function
  const topicsWithSubtopics = await getTopicsWithSubtopics();

  // Get subtopics for this topic using cached function
  const subtopics = await getSubtopics(topicId);

  // Fetch all exercise cards for subtopics in this topic
  // Get the subtopic IDs first
  const topicSubtopicIds = subtopics.map((s) => s.id);

  const exerciseCards = await db
    .select({
      id: exercisesCardsTable.id,
      subtopic_id: exercisesCardsTable.subtopic_id,
      description: exercisesCardsTable.description,
      difficulty: exercisesCardsTable.difficulty,
      order_index: exercisesCardsTable.order_index,
    })
    .from(exercisesCardsTable)
    .where(eq(exercisesCardsTable.subtopic_id, topicSubtopicIds[0]));

  // If there are more subtopics, fetch their exercises too and combine results
  if (topicSubtopicIds.length > 1) {
    for (let i = 1; i < topicSubtopicIds.length; i++) {
      const moreCards = await db
        .select({
          id: exercisesCardsTable.id,
          subtopic_id: exercisesCardsTable.subtopic_id,
          description: exercisesCardsTable.description,
          difficulty: exercisesCardsTable.difficulty,
          order_index: exercisesCardsTable.order_index,
        })
        .from(exercisesCardsTable)
        .where(eq(exercisesCardsTable.subtopic_id, topicSubtopicIds[i]));

      exerciseCards.push(...moreCards);
    }
  }

  // Get all exercises for the cards we fetched
  const allExercises: { id: string; exercise_card_id: string }[] = [];

  // Process in batches to avoid using .in operator which has TypeScript issues
  const cardIds = exerciseCards.map((card) => card.id);
  for (const cardId of cardIds) {
    const exercises = await db
      .select({
        id: exercisesTable.id,
        exercise_card_id: exercisesTable.exercise_card_id,
      })
      .from(exercisesTable)
      .where(eq(exercisesTable.exercise_card_id, cardId));

    allExercises.push(...exercises);
  }

  // Group exercises by card ID
  const exercisesByCard = allExercises.reduce((acc, exercise) => {
    if (!exercise.exercise_card_id) return acc;

    if (!acc[exercise.exercise_card_id]) {
      acc[exercise.exercise_card_id] = [];
    }
    acc[exercise.exercise_card_id].push(exercise.id);
    return acc;
  }, {} as Record<string, string[]>);

  // This part is user-specific and cannot be cached
  // Get completed exercises for this user
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

  // Calculate completion for each card
  const cardCompletionInfo = exerciseCards.reduce((acc, card) => {
    const exercisesForCard = exercisesByCard[card.id] || [];
    const totalExercises = exercisesForCard.length;
    const completedCount = exercisesForCard.filter((id) =>
      correctExercises.has(id)
    ).length;

    acc[card.id] = {
      total_exercises: totalExercises,
      completed_exercises: completedCount,
      is_completed: totalExercises > 0 && completedCount === totalExercises,
    };

    return acc;
  }, {} as Record<string, { total_exercises: number; completed_exercises: number; is_completed: boolean }>);

  // Format exercise cards with completion info
  const exerciseCardsWithCompletion = exerciseCards.map((card) => ({
    ...card,
    ...(cardCompletionInfo[card.id] || {
      total_exercises: 0,
      completed_exercises: 0,
      is_completed: false,
    }),
  }));

  // Group exercise cards by subtopic for easy access and sort by order_index
  const exerciseCardsBySubtopic = exerciseCardsWithCompletion.reduce(
    (acc, card) => {
      if (!card.subtopic_id) return acc;

      if (!acc[card.subtopic_id]) {
        acc[card.subtopic_id] = [];
      }
      acc[card.subtopic_id].push(card);
      return acc;
    },
    {} as Record<string, ExerciseCardType[]>
  );

  // Sort cards within each subtopic by order_index
  Object.keys(exerciseCardsBySubtopic).forEach((subtopicId) => {
    exerciseCardsBySubtopic[subtopicId].sort((a, b) => {
      // If order_index is null, place at the end
      if (a.order_index === null && b.order_index === null) return 0;
      if (a.order_index === null) return 1;
      if (b.order_index === null) return -1;
      return a.order_index - b.order_index;
    });
  });

  // Group exercise cards by subtopic
  const subtopicsWithExercises: SubtopicWithExercisesType[] = subtopics.map(
    (s) => ({
      ...s,
      exercise_cards: exerciseCardsBySubtopic[s.id] || [],
    })
  );

  return (
    <ExercisesTopicClient
      currentTopic={topic[0]}
      topicsWithSubtopics={topicsWithSubtopics}
      subtopicsWithExercises={subtopicsWithExercises}
      activeSubtopicId={subtopicId}
      userId={user.id as string}
    />
  );
}

// Export with the 'any' type to bypass Next.js type constraints
export default ExercisesTopicPage;
