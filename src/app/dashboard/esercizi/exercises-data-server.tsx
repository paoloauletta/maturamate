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
import { redirect } from "next/navigation";
import { getTopics } from "@/utils/cache";

// Define interfaces for the data structure
export interface ExerciseCard {
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

export interface SubtopicGroup {
  subtopic_name: string;
  subtopic_order: number | null;
  exercise_cards: ExerciseCard[];
}

export interface TopicGroup {
  topic_name: string;
  topic_order: number | null;
  subtopics: Record<string, SubtopicGroup>;
}

export interface SubtopicType {
  id: string;
  name: string;
  order_index: number | null;
}

export interface TopicType {
  id: string;
  name: string;
  order_index: number | null;
  subtopics: SubtopicType[];
}

export interface ExercisesData {
  topicsWithSubtopics: TopicType[];
  exerciseCardsByTopic: Record<string, TopicGroup>;
  firstTopic: string | null;
}

export async function getExercisesData(): Promise<ExercisesData> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin");
  }

  // Fetch all topics ordered by order_index using the cached function
  const topics = await getTopics();

  let firstTopic: string | null = null;
  if (topics.length > 0) {
    firstTopic = topics[0].id;
  }

  // Default empty data if no topics are available
  const defaultData: ExercisesData = {
    topicsWithSubtopics: [],
    exerciseCardsByTopic: {},
    firstTopic,
  };

  // If no topics are available, return empty data
  if (topics.length === 0) {
    return defaultData;
  }

  // Fetch subtopics for all topics
  const topicsWithSubtopics: TopicType[] = await Promise.all(
    topics.map(async (topic) => {
      const subtopics = await db
        .select({
          id: subtopicsTable.id,
          name: subtopicsTable.name,
          order_index: subtopicsTable.order_index,
        })
        .from(subtopicsTable)
        .where(eq(subtopicsTable.topic_id, topic.id))
        .orderBy(subtopicsTable.order_index);

      return {
        id: topic.id,
        name: topic.name,
        order_index: topic.order_index,
        subtopics,
      };
    })
  );

  // Fetch all exercise cards with their relevant data
  const exerciseCards = await db
    .select({
      id: exercisesCardsTable.id,
      subtopic_id: exercisesCardsTable.subtopic_id,
      description: exercisesCardsTable.description,
      difficulty: exercisesCardsTable.difficulty,
      created_at: exercisesCardsTable.created_at,
    })
    .from(exercisesCardsTable);

  // Get completed exercises for the current user
  const completedExercises = user?.id
    ? await db
        .select({
          exercise_id: completedExercisesTable.exercise_id,
          is_correct: completedExercisesTable.is_correct,
        })
        .from(completedExercisesTable)
        .where(eq(completedExercisesTable.user_id, user.id))
    : [];

  // Set of correctly completed exercises
  const correctExercises = new Set(
    completedExercises
      .filter((ex) => ex.is_correct && ex.exercise_id)
      .map((ex) => ex.exercise_id)
  );

  // Get all exercises to determine completion status
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
      score: totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0,
    };

    return acc;
  }, {} as Record<string, { total_exercises: number; completed_exercises: number; is_completed: boolean; score: number }>);

  // Fetch additional data for subtopics and topics
  const subtopicsData = await db
    .select({
      id: subtopicsTable.id,
      name: subtopicsTable.name,
      topic_id: subtopicsTable.topic_id,
      order_index: subtopicsTable.order_index,
    })
    .from(subtopicsTable);

  const topicsData = await db
    .select({
      id: topicsTable.id,
      name: topicsTable.name,
      order_index: topicsTable.order_index,
    })
    .from(topicsTable);

  // Map for quick lookups
  const subtopicsMap = subtopicsData.reduce((acc, subtopic) => {
    acc[subtopic.id] = subtopic;
    return acc;
  }, {} as Record<string, (typeof subtopicsData)[0]>);

  const topicsMap = topicsData.reduce((acc, topic) => {
    acc[topic.id] = topic;
    return acc;
  }, {} as Record<string, (typeof topicsData)[0]>);

  // Enrich exercise cards with subtopic and topic information
  const enrichedCards = exerciseCards.map((card) => {
    const subtopic = card.subtopic_id ? subtopicsMap[card.subtopic_id] : null;
    const topicId = subtopic?.topic_id || null;
    const topic = topicId ? topicsMap[topicId] : null;
    const completion = cardCompletionInfo[card.id] || {
      total_exercises: 0,
      completed_exercises: 0,
      is_completed: false,
      score: 0,
    };

    return {
      id: card.id,
      subtopic_id: card.subtopic_id,
      subtopic_name: subtopic?.name || null,
      topic_name: topic?.name || null,
      topic_id: topicId,
      description: card.description,
      difficulty: card.difficulty,
      created_at: card.created_at,
      topic_order: topic?.order_index || null,
      subtopic_order: subtopic?.order_index || null,
      is_completed: completion.is_completed,
      score: completion.score,
      total_exercises: completion.total_exercises,
    };
  });

  // Organize cards by topic and subtopic
  const exerciseCardsByTopic: Record<string, TopicGroup> = {};

  for (const card of enrichedCards) {
    if (!card.topic_id || !card.subtopic_id) continue;

    // Initialize topic if not exists
    if (!exerciseCardsByTopic[card.topic_id]) {
      exerciseCardsByTopic[card.topic_id] = {
        topic_name: card.topic_name || "Unknown",
        topic_order: card.topic_order,
        subtopics: {},
      };
    }

    // Initialize subtopic if not exists
    if (!exerciseCardsByTopic[card.topic_id].subtopics[card.subtopic_id]) {
      exerciseCardsByTopic[card.topic_id].subtopics[card.subtopic_id] = {
        subtopic_name: card.subtopic_name || "Unknown",
        subtopic_order: card.subtopic_order,
        exercise_cards: [],
      };
    }

    // Add card to the subtopic
    exerciseCardsByTopic[card.topic_id].subtopics[
      card.subtopic_id
    ].exercise_cards.push(card);
  }

  // Sort exercise cards within each subtopic by difficulty
  for (const topicId in exerciseCardsByTopic) {
    for (const subtopicId in exerciseCardsByTopic[topicId].subtopics) {
      exerciseCardsByTopic[topicId].subtopics[subtopicId].exercise_cards.sort(
        (a, b) => a.difficulty - b.difficulty
      );
    }
  }

  return {
    topicsWithSubtopics,
    exerciseCardsByTopic,
    firstTopic,
  };
}
