import { db } from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import {
  exercisesTable,
  completedExercisesTable,
  topicsTable,
  subtopicsTable,
  exercisesCardsTable,
} from "@/db/schema";

// Define the StatisticsData interface for the client component
export interface StatisticsData {
  userStats: {
    overallProgress: number;
    uniqueCompletedExercises: number;
    totalAvailableExercises: number;
    totalExercises: number;
    correctExercises: number;
    incorrectExercises: number;
    flaggedExercises: {
      total: number;
      items: Array<{ path: string; title: string }>;
    };
    topicProgress: Array<{
      topic: string;
      completed: number;
      total: number;
      correctAttempts: number;
      totalAttempts: number;
    }>;
    weakSubtopics: Array<{
      subtopic: string;
      wrongCount: number;
      topicId: string;
      subtopicId: string;
    }>;
  };
  completionData: {
    topicsCompletionPercentage: number;
    completedTopics: number;
    totalTopics: number;
  };
  continueUrl: string;
}

export async function getStatisticsData() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // Get total exercises and completed exercises
  const exerciseStats = await db
    .select({
      total: sql<number>`COUNT(DISTINCT ${exercisesTable.id})`,
      completed: sql<number>`COUNT(DISTINCT CASE WHEN ${completedExercisesTable.id} IS NOT NULL THEN ${exercisesTable.id} END)`,
    })
    .from(exercisesTable)
    .leftJoin(
      completedExercisesTable,
      sql`${completedExercisesTable.exercise_id} = ${exercisesTable.id} AND ${completedExercisesTable.user_id} = ${userId}`
    );

  // Get completion by topic
  const topicStats = await db
    .select({
      topic_id: topicsTable.id,
      topic_name: topicsTable.name,
      total: sql<number>`COUNT(DISTINCT ${exercisesTable.id})`,
      completed: sql<number>`COUNT(DISTINCT CASE WHEN ${completedExercisesTable.id} IS NOT NULL THEN ${exercisesTable.id} END)`,
    })
    .from(exercisesTable)
    .innerJoin(
      exercisesCardsTable,
      sql`${exercisesTable.exercise_card_id} = ${exercisesCardsTable.id}`
    )
    .innerJoin(
      subtopicsTable,
      sql`${exercisesCardsTable.subtopic_id} = ${subtopicsTable.id}`
    )
    .innerJoin(topicsTable, sql`${subtopicsTable.topic_id} = ${topicsTable.id}`)
    .leftJoin(
      completedExercisesTable,
      sql`${completedExercisesTable.exercise_id} = ${exercisesTable.id} AND ${completedExercisesTable.user_id} = ${userId}`
    )
    .groupBy(topicsTable.id, topicsTable.name)
    .orderBy(topicsTable.name);

  // Get recent activity (last 10 completed exercises)
  const recentActivity = await db
    .select({
      id: completedExercisesTable.id,
      exercise_id: completedExercisesTable.exercise_id,
      is_correct: completedExercisesTable.is_correct,
      attempt: completedExercisesTable.attempt,
      completed_at: completedExercisesTable.created_at,
      exercise_card_id: exercisesTable.exercise_card_id,
      subtopic_name: subtopicsTable.name,
      topic_name: topicsTable.name,
    })
    .from(completedExercisesTable)
    .innerJoin(
      exercisesTable,
      sql`${completedExercisesTable.exercise_id} = ${exercisesTable.id}`
    )
    .innerJoin(
      exercisesCardsTable,
      sql`${exercisesTable.exercise_card_id} = ${exercisesCardsTable.id}`
    )
    .innerJoin(
      subtopicsTable,
      sql`${exercisesCardsTable.subtopic_id} = ${subtopicsTable.id}`
    )
    .innerJoin(topicsTable, sql`${subtopicsTable.topic_id} = ${topicsTable.id}`)
    .where(sql`${completedExercisesTable.user_id} = ${userId}`)
    .orderBy(sql`${completedExercisesTable.created_at} DESC`)
    .limit(10);

  // Convert raw data to the expected format for the StatisticsData interface
  // This is just a placeholder - in a real app you would compute these values from the DB results
  const mockStatisticsData: StatisticsData = {
    userStats: {
      overallProgress: 45,
      uniqueCompletedExercises: exerciseStats[0]?.completed || 0,
      totalAvailableExercises: exerciseStats[0]?.total || 0,
      totalExercises: 100,
      correctExercises: 75,
      incorrectExercises: 25,
      flaggedExercises: {
        total: 5,
        items: [
          {
            path: "/dashboard/esercizi/card/1",
            title: "Derivate di funzioni composte",
          },
          { path: "/dashboard/esercizi/card/2", title: "Calcolo di limiti" },
          {
            path: "/dashboard/esercizi/card/3",
            title: "Equazioni differenziali",
          },
        ],
      },
      topicProgress: topicStats.map((topic) => ({
        topic: topic.topic_name,
        completed: topic.completed,
        total: topic.total,
        correctAttempts: Math.floor(topic.completed * 0.8), // Mock data
        totalAttempts: topic.completed, // Mock data
      })),
      weakSubtopics: [
        {
          subtopic: "Derivate di funzioni composte",
          wrongCount: 8,
          topicId: "topic-1",
          subtopicId: "subtopic-1",
        },
        {
          subtopic: "Calcolo di limiti con forme indeterminate",
          wrongCount: 6,
          topicId: "topic-1",
          subtopicId: "subtopic-2",
        },
        {
          subtopic: "Integrali di funzioni razionali",
          wrongCount: 5,
          topicId: "topic-2",
          subtopicId: "subtopic-3",
        },
      ],
    },
    completionData: {
      topicsCompletionPercentage: 30,
      completedTopics: 3,
      totalTopics: 10,
    },
    continueUrl: "/dashboard/teoria/last-topic",
  };

  return mockStatisticsData;
}
