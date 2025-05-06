import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getTopicsWithSubtopics, getTopics, getSubtopics } from "@/utils/cache";
import { db } from "@/db/drizzle";
import {
  exercisesCardsTable,
  exercisesTable,
  completedExercisesTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";

// This function will be used to fetch the topic data for the page
export async function getTopicData(topicId: string, subtopicId?: string) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // Get topics with subtopics
  const topicsWithSubtopics = await getTopicsWithSubtopics();

  // Find the current topic
  const currentTopic = topicsWithSubtopics.find(
    (topic) => topic.id === topicId
  );

  // If the topic doesn't exist, show 404
  if (!currentTopic) {
    notFound();
  }

  // Get subtopics for this topic
  const subtopicsForTopic = await db
    .select()
    .from(subtopicsTable)
    .where(eq(subtopicsTable.topic_id, topicId))
    .orderBy(subtopicsTable.order_index);

  // Determine active subtopic ID (either from URL or first subtopic)
  const activeSubtopicId =
    subtopicId ||
    (subtopicsForTopic.length > 0 ? subtopicsForTopic[0].id : undefined);

  // Get exercise cards for each subtopic
  const subtopicsWithExercises = await Promise.all(
    subtopicsForTopic.map(async (subtopic) => {
      // Get exercise cards with completion data for this subtopic
      const exerciseCards = await db
        .select({
          id: exercisesCardsTable.id,
          subtopic_id: exercisesCardsTable.subtopic_id,
          description: exercisesCardsTable.description,
          difficulty: exercisesCardsTable.difficulty,
          order_index: exercisesCardsTable.order_index,
          total_exercises: sql<number>`COUNT(DISTINCT ${exercisesTable.id})`,
          completed_exercises: sql<number>`COUNT(DISTINCT CASE WHEN ${completedExercisesTable.id} IS NOT NULL THEN ${exercisesTable.id} END)`,
          is_completed: sql<boolean>`CASE WHEN COUNT(DISTINCT ${exercisesTable.id}) = COUNT(DISTINCT CASE WHEN ${completedExercisesTable.id} IS NOT NULL THEN ${exercisesTable.id} END) AND COUNT(DISTINCT ${exercisesTable.id}) > 0 THEN TRUE ELSE FALSE END`,
        })
        .from(exercisesCardsTable)
        .leftJoin(
          exercisesTable,
          eq(exercisesTable.exercise_card_id, exercisesCardsTable.id)
        )
        .leftJoin(
          completedExercisesTable,
          and(
            eq(completedExercisesTable.exercise_id, exercisesTable.id),
            eq(completedExercisesTable.user_id, userId)
          )
        )
        .where(eq(exercisesCardsTable.subtopic_id, subtopic.id))
        .groupBy(
          exercisesCardsTable.id,
          exercisesCardsTable.subtopic_id,
          exercisesCardsTable.description,
          exercisesCardsTable.difficulty,
          exercisesCardsTable.order_index
        )
        .orderBy(exercisesCardsTable.order_index);

      return {
        ...subtopic,
        exercise_cards: exerciseCards,
      };
    })
  );

  return {
    currentTopic,
    topicsWithSubtopics,
    subtopicsWithExercises,
    activeSubtopicId,
    userId,
  };
}
