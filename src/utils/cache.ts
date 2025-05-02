import { cache } from "react";
import { db } from "@/db/drizzle";
import {
  topicsTable,
  subtopicsTable,
  theoryTable,
  exercisesCardsTable,
  exercisesTable,
  completedExercisesTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Cache topics - these change very infrequently
export const getTopics = cache(async () => {
  return db.select().from(topicsTable).orderBy(topicsTable.order_index);
});

// Cache subtopics for a specific topic
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

// Cache exercises for a card
export const getExercisesForCard = cache(async (cardId: string) => {
  return db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.exercise_card_id, cardId))
    .orderBy(exercisesTable.order_index);
});

// Cache exercise card details - non-user specific content
export const getExerciseCardDetails = cache(async (cardId: string) => {
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
});

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

// Cache navigation structure for the entire app
export const getNavigationStructure = cache(async () => {
  return getTopicsWithSubtopics();
});
