import { cache } from "react";
import { db } from "@/db/drizzle";
import {
  topicsTable,
  subtopicsTable,
  theoryTable,
  exercisesCardsTable,
  exercisesTable,
  completedExercisesTable,
  completedTopicsTable,
  completedSubtopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache topics with improved tagging and longer duration
export const getTopics = cache(async () => {
  return db.select().from(topicsTable).orderBy(topicsTable.order_index);
});

// Improved subtopics caching with proper tags
export const getSubtopics = cache(async (topicId: string) => {
  return db
    .select()
    .from(subtopicsTable)
    .where(eq(subtopicsTable.topic_id, topicId))
    .orderBy(subtopicsTable.order_index);
});

// Cache all subtopics (useful for navigation)
export const getAllSubtopics = cache(async () => {
  return db.select().from(subtopicsTable).orderBy(subtopicsTable.order_index);
});

// Cache theory content for a subtopic
export const getTheoryContent = cache(async (subtopicId: string) => {
  return db
    .select()
    .from(theoryTable)
    .where(eq(theoryTable.subtopic_id, subtopicId));
});

// Cache exercise cards for a subtopic
export const getExerciseCards = cache(async (subtopicId: string) => {
  return db
    .select()
    .from(exercisesCardsTable)
    .where(eq(exercisesCardsTable.subtopic_id, subtopicId));
});

// Use unstable_cache for exercise data with tags for better invalidation
export const getExercisesForCard = unstable_cache(
  async (cardId: string) => {
    return db
      .select()
      .from(exercisesTable)
      .where(eq(exercisesTable.exercise_card_id, cardId))
      .orderBy(exercisesTable.order_index);
  },
  ["exercises-for-card"],
  { revalidate: 3600 }
);

// Use unstable_cache for card details with tags
export const getExerciseCardDetails = unstable_cache(
  async (cardId: string) => {
    const card = await db
      .select({
        id: exercisesCardsTable.id,
        description: exercisesCardsTable.description,
        difficulty: exercisesCardsTable.difficulty,
        created_at: exercisesCardsTable.created_at,
        subtopic_id: exercisesCardsTable.subtopic_id,
        subtopic_name: subtopicsTable.name,
        subtopic_order: subtopicsTable.order_index,
        topic_id: subtopicsTable.topic_id,
        topic_name: topicsTable.name,
        topic_order: topicsTable.order_index,
      })
      .from(exercisesCardsTable)
      .leftJoin(
        subtopicsTable,
        eq(exercisesCardsTable.subtopic_id, subtopicsTable.id)
      )
      .leftJoin(topicsTable, eq(subtopicsTable.topic_id, topicsTable.id))
      .where(eq(exercisesCardsTable.id, cardId));

    return card.length > 0 ? card[0] : null;
  },
  ["exercise-card-details"],
  { revalidate: 3600 }
);

// Cache topics with subtopics - for navigation structure
export const getTopicsWithSubtopics = cache(async () => {
  const topics = await getTopics();
  const subtopics = await getAllSubtopics();

  return topics.map((topic) => ({
    ...topic,
    subtopics: subtopics.filter((s) => s.topic_id === topic.id),
  }));
});

// This function does NOT use cache because it's user-specific
export const getUserCompletedExercises = async (userId: string) => {
  return db
    .select({
      exercise_id: completedExercisesTable.exercise_id,
      is_correct: completedExercisesTable.is_correct,
    })
    .from(completedExercisesTable)
    .where(eq(completedExercisesTable.user_id, userId));
};

// NEW: Get user completion status for topics and subtopics
// This is user-specific, but we cache it with a very short TTL
export const getUserCompletionStatus = unstable_cache(
  async (userId: string) => {
    const completedTopics = await db
      .select({
        topicId: completedTopicsTable.topic_id,
      })
      .from(completedTopicsTable)
      .where(eq(completedTopicsTable.user_id, userId));

    const completedSubtopics = await db
      .select({
        subtopicId: completedSubtopicsTable.subtopic_id,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, userId));

    return {
      completedTopicIds: completedTopics.map((t) => t.topicId),
      completedSubtopicIds: completedSubtopics.map((s) => s.subtopicId),
    };
  },
  // Use a fixed tag array with a clear naming pattern
  ["user-completion-status"],
  // Short cache time since this data changes frequently
  { revalidate: 30 }
);

// Cache navigation structure for the entire app
export const getNavigationStructure = cache(async () => {
  return getTopicsWithSubtopics();
});
