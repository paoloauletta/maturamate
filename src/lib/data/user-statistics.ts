import { and, count, desc, eq, gt, isNull, not, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  completedExercisesTable,
  completedExercisesCardsTable,
  completedSimulationsTable,
  flaggedExercisesTable,
  flaggedExercisesCardsTable,
  topicsTable,
  subtopicsTable,
  exercisesTable,
  exercisesCardsTable,
  simulationsTable,
} from "@/db/schema";

export type UserStatistics = {
  totalExercises: number;
  correctExercises: number;
  incorrectExercises: number;
  weekExercises: number;
  simulationsCompleted: number;
  flaggedExercises: {
    total: number;
    items: {
      id: string;
      title: string;
      path: string;
    }[];
  };
  topicProgress: Array<{
    topic: string;
    topicId: string;
    completed: number;
    total: number;
    correct: number;
    totalAttempts: number;
    correctAttempts: number;
  }>;
  weakSubtopics: Array<{
    subtopic: string;
    subtopicId: string;
    wrongCount: number;
    topic: string;
    topicId: string;
  }>;
  overallProgress: number; // Overall progress percentage
  totalAvailableExercises: number; // Total number of exercises in the system
  uniqueCompletedExercises: number; // Number of unique exercises completed by the user
};

export async function getUserStatistics(
  userId: string
): Promise<UserStatistics> {
  // Get one week ago date for weekly stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get total exercises and correct/incorrect counts
  const exerciseStats = await db
    .select({
      total: count(),
      correct: sql<number>`sum(case when ${completedExercisesTable.is_correct} = true then 1 else 0 end)`,
      incorrect: sql<number>`sum(case when ${completedExercisesTable.is_correct} = false then 1 else 0 end)`,
    })
    .from(completedExercisesTable)
    .where(eq(completedExercisesTable.user_id, userId));

  // Get weekly exercise count
  const weeklyExercises = await db
    .select({ count: count() })
    .from(completedExercisesTable)
    .where(
      and(
        eq(completedExercisesTable.user_id, userId),
        gt(completedExercisesTable.created_at, oneWeekAgo)
      )
    );

  // Get total simulations completed
  const simulationsCompleted = await db
    .select({ count: count() })
    .from(completedSimulationsTable)
    .where(eq(completedSimulationsTable.user_id, userId));

  // Get flagged exercises
  const flaggedItems = await db
    .select({
      id: flaggedExercisesTable.exercise_id,
      cardId: exercisesTable.exercise_card_id,
      subtopicId: exercisesCardsTable.subtopic_id,
    })
    .from(flaggedExercisesTable)
    .innerJoin(
      exercisesTable,
      eq(flaggedExercisesTable.exercise_id, exercisesTable.id)
    )
    .innerJoin(
      exercisesCardsTable,
      eq(exercisesTable.exercise_card_id, exercisesCardsTable.id)
    )
    .where(eq(flaggedExercisesTable.user_id, userId))
    .limit(5); // Only get a few for the dashboard

  // Get subtopic and topic info for flagged exercises
  const flaggedExercisesWithInfo = await Promise.all(
    flaggedItems
      .filter((item) => item.id !== null && item.cardId !== null) // Skip items with null IDs
      .map(async (item) => {
        // Using non-null assertion since we filtered nulls above
        const itemId = item.id!;
        const cardId = item.cardId!;

        const subtopic = item.subtopicId
          ? await db
              .select({ name: subtopicsTable.name })
              .from(subtopicsTable)
              .where(eq(subtopicsTable.id, item.subtopicId))
              .limit(1)
          : [];

        const exerciseCard = await db
          .select({ description: exercisesCardsTable.description })
          .from(exercisesCardsTable)
          .where(eq(exercisesCardsTable.id, cardId))
          .limit(1);

        return {
          id: itemId,
          title: `${subtopic[0]?.name || "Esercizio"} - ${
            exerciseCard[0]?.description || ""
          }`,
          path: `/dashboard/esercizi/card/${cardId}`,
        };
      })
  );

  // Find the subtopics with the most wrong exercises
  const wrongExercises = await db
    .select({
      exerciseId: completedExercisesTable.exercise_id,
      cardId: exercisesTable.exercise_card_id,
      subtopicId: exercisesCardsTable.subtopic_id,
    })
    .from(completedExercisesTable)
    .innerJoin(
      exercisesTable,
      eq(completedExercisesTable.exercise_id, exercisesTable.id)
    )
    .innerJoin(
      exercisesCardsTable,
      eq(exercisesTable.exercise_card_id, exercisesCardsTable.id)
    )
    .where(
      and(
        eq(completedExercisesTable.user_id, userId),
        eq(completedExercisesTable.is_correct, false),
        not(isNull(exercisesCardsTable.subtopic_id))
      )
    );

  // Group by subtopic and count wrong exercises
  const subtopicWrongCounts: Record<string, number> = {};
  for (const exercise of wrongExercises) {
    if (exercise.subtopicId) {
      subtopicWrongCounts[exercise.subtopicId] =
        (subtopicWrongCounts[exercise.subtopicId] || 0) + 1;
    }
  }

  // Get details for the subtopics with wrong exercises
  const subtopicsWithWrongExercises = await Promise.all(
    Object.entries(subtopicWrongCounts)
      .sort(([, countA], [, countB]) => countB - countA) // Sort by count (descending)
      .slice(0, 5) // Take top 5
      .map(async ([subtopicId, wrongCount]) => {
        const subtopic = await db
          .select({
            name: subtopicsTable.name,
            topicId: subtopicsTable.topic_id,
          })
          .from(subtopicsTable)
          .where(eq(subtopicsTable.id, subtopicId))
          .limit(1);

        let topicName = "Generale";
        let topicId = "";

        if (subtopic[0]?.topicId) {
          const topic = await db
            .select({
              name: topicsTable.name,
              id: topicsTable.id,
            })
            .from(topicsTable)
            .where(eq(topicsTable.id, subtopic[0].topicId))
            .limit(1);

          topicName = topic[0]?.name || topicName;
          topicId = topic[0]?.id || "";
        }

        return {
          subtopic: subtopic[0]?.name || "Sconosciuto",
          subtopicId,
          wrongCount,
          topic: topicName,
          topicId,
        };
      })
  );

  // Get topic progress data
  const topics = await db.select().from(topicsTable);

  const topicProgress = await Promise.all(
    topics.map(async (topic) => {
      // Get all subtopics for this topic
      const subtopics = await db
        .select()
        .from(subtopicsTable)
        .where(eq(subtopicsTable.topic_id, topic.id));

      const subtopicIds = subtopics.map((s) => s.id);

      // Get count of all exercises for this topic's subtopics
      let totalExercisesCount = 0;
      let completedExercisesCount = 0;
      let correctExercisesCount = 0;
      let totalAttemptsCount = 0;
      let correctAttemptsCount = 0;

      for (const subtopicId of subtopicIds) {
        // Get exercise cards for this subtopic
        const exerciseCards = await db
          .select()
          .from(exercisesCardsTable)
          .where(eq(exercisesCardsTable.subtopic_id, subtopicId));

        const exerciseCardIds = exerciseCards.map((ec) => ec.id);

        // Count total exercises
        for (const cardId of exerciseCardIds) {
          const exercisesCount = await db
            .select({ count: count() })
            .from(exercisesTable)
            .where(eq(exercisesTable.exercise_card_id, cardId));

          totalExercisesCount += exercisesCount[0]?.count || 0;

          // Count unique completed exercises for this card
          const uniqueCompletedExercisesResult = await db
            .select({
              exerciseId: completedExercisesTable.exercise_id,
            })
            .from(completedExercisesTable)
            .innerJoin(
              exercisesTable,
              eq(completedExercisesTable.exercise_id, exercisesTable.id)
            )
            .where(
              and(
                eq(exercisesTable.exercise_card_id, cardId),
                eq(completedExercisesTable.user_id, userId)
              )
            )
            .groupBy(completedExercisesTable.exercise_id);

          completedExercisesCount += uniqueCompletedExercisesResult.length;

          // Count unique correctly completed exercises for this card
          const uniqueCorrectExercisesResult = await db
            .select({
              exerciseId: completedExercisesTable.exercise_id,
            })
            .from(completedExercisesTable)
            .innerJoin(
              exercisesTable,
              eq(completedExercisesTable.exercise_id, exercisesTable.id)
            )
            .where(
              and(
                eq(exercisesTable.exercise_card_id, cardId),
                eq(completedExercisesTable.user_id, userId),
                eq(completedExercisesTable.is_correct, true)
              )
            )
            .groupBy(completedExercisesTable.exercise_id);

          correctExercisesCount += uniqueCorrectExercisesResult.length;

          // Count all attempts for accuracy - this includes repeated attempts on the same exercises
          const allAttempts = await db
            .select({ count: count() })
            .from(completedExercisesTable)
            .innerJoin(
              exercisesTable,
              eq(completedExercisesTable.exercise_id, exercisesTable.id)
            )
            .where(
              and(
                eq(exercisesTable.exercise_card_id, cardId),
                eq(completedExercisesTable.user_id, userId)
              )
            );

          totalAttemptsCount += allAttempts[0]?.count || 0;

          // Count all correct attempts
          const allCorrectAttempts = await db
            .select({ count: count() })
            .from(completedExercisesTable)
            .innerJoin(
              exercisesTable,
              eq(completedExercisesTable.exercise_id, exercisesTable.id)
            )
            .where(
              and(
                eq(exercisesTable.exercise_card_id, cardId),
                eq(completedExercisesTable.user_id, userId),
                eq(completedExercisesTable.is_correct, true)
              )
            );

          correctAttemptsCount += allCorrectAttempts[0]?.count || 0;
        }
      }

      return {
        topic: topic.name,
        topicId: topic.id,
        completed: completedExercisesCount,
        total: totalExercisesCount,
        correct: correctExercisesCount,
        totalAttempts: totalAttemptsCount,
        correctAttempts: correctAttemptsCount,
      };
    })
  );

  // Calculate overall progress (unique completed exercises)

  // Get total number of exercises in the system
  const totalExercisesResult = await db
    .select({ count: count() })
    .from(exercisesTable);
  const totalAvailableExercises = totalExercisesResult[0]?.count || 0;

  // Get distinct completed exercises by this user
  const uniqueCompletedExercisesResult = await db
    .select({
      exerciseId: completedExercisesTable.exercise_id,
    })
    .from(completedExercisesTable)
    .where(eq(completedExercisesTable.user_id, userId))
    .groupBy(completedExercisesTable.exercise_id);

  const uniqueCompletedExercises = uniqueCompletedExercisesResult.length;

  // Calculate progress percentage
  const overallProgress =
    totalAvailableExercises > 0
      ? Math.round((uniqueCompletedExercises / totalAvailableExercises) * 100)
      : 0;

  return {
    totalExercises: exerciseStats[0]?.total || 0,
    correctExercises: exerciseStats[0]?.correct || 0,
    incorrectExercises: exerciseStats[0]?.incorrect || 0,
    weekExercises: weeklyExercises[0]?.count || 0,
    simulationsCompleted: simulationsCompleted[0]?.count || 0,
    flaggedExercises: {
      total: flaggedExercisesWithInfo.length,
      items: flaggedExercisesWithInfo,
    },
    topicProgress,
    weakSubtopics: subtopicsWithWrongExercises,
    overallProgress,
    totalAvailableExercises,
    uniqueCompletedExercises,
  };
}

// Calculate days until exam (fixed date: June 19, 2025)
export function getDaysUntilExam(): number {
  const today = new Date();
  const examDate = new Date(2025, 5, 19); // June 19, 2025
  const diffTime = Math.abs(examDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate user streak (this is a placeholder - you'd need to add a table to track this)
export function getUserStreak(): number {
  // For now, return a mock value
  return 4;
}

// Get weekly goals (placeholder - you'd need to add a table to track this)
export function getWeeklyGoals(): { simulations: number; exercises: number } {
  // For now, return mock values
  return {
    simulations: 3,
    exercises: 50,
  };
}
