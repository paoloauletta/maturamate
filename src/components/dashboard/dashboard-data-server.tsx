import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getUserStatistics,
  getDaysUntilExam,
  getUserStreak,
  getWeeklyGoals,
} from "@/lib/data/user-statistics";
import { auth } from "@/lib/auth";

export type DashboardData = {
  userData: {
    name: string;
    daysToExam: number;
    overallProgress: number;
    totalAvailableExercises: number;
    uniqueCompletedExercises: number;
    totalExercises: number;
    correctExercises: number;
    incorrectExercises: number;
    weekExercises: number;
    simulationsCompleted: number;
    weakestTopic: string;
    streakDays: number;
    weeklyGoal: {
      simulations: number;
      exercises: number;
    };
    flaggedExercises: Array<{ id: string; title: string; path: string }>;
  };
  completionData: {
    totalTopics: number;
    completedTopics: number;
    topicsCompletionPercentage: number;
    totalSubtopics: number;
    completedSubtopics: number;
    subtopicsCompletionPercentage: number;
    firstUncompletedTopic: any;
    firstUncompletedSubtopic: any;
  };
  randomQuote: string;
  continueUrl: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;

  // Default mock data in case we don't have a userId
  let userData = {
    name: user?.name || "Studente",
    daysToExam: getDaysUntilExam(),
    overallProgress: 0,
    totalAvailableExercises: 0,
    uniqueCompletedExercises: 0,
    totalExercises: 0,
    correctExercises: 0,
    incorrectExercises: 0,
    weekExercises: 0,
    simulationsCompleted: 0,
    weakestTopic: "Derivate",
    streakDays: getUserStreak(),
    weeklyGoal: getWeeklyGoals(),
    flaggedExercises: [] as Array<{ id: string; title: string; path: string }>,
  };

  // Default completion data
  let completionData = {
    totalTopics: 0,
    completedTopics: 0,
    topicsCompletionPercentage: 0,
    totalSubtopics: 0,
    completedSubtopics: 0,
    subtopicsCompletionPercentage: 0,
    firstUncompletedTopic: null as any,
    firstUncompletedSubtopic: null as any,
  };

  // Get real data if we have a userId
  if (userId) {
    const userStats = await getUserStatistics(userId);

    // Find weakest topic (lowest accuracy rate)
    let weakestTopic = "Algebra";
    let lowestAccuracy = 100;

    for (const topic of userStats.topicProgress) {
      const accuracy =
        topic.completed > 0
          ? Math.round((topic.correct / topic.completed) * 100)
          : 0;
      if (accuracy < lowestAccuracy && topic.completed > 0) {
        lowestAccuracy = accuracy;
        weakestTopic = topic.topic;
      }
    }

    // Override mock data with real data
    userData = {
      ...userData,
      totalExercises: userStats.totalExercises,
      correctExercises: userStats.correctExercises,
      incorrectExercises: userStats.incorrectExercises,
      weekExercises: userStats.weekExercises,
      simulationsCompleted: userStats.simulationsCompleted,
      weakestTopic,
      flaggedExercises: userStats.flaggedExercises.items,
      overallProgress: userStats.overallProgress,
      totalAvailableExercises: userStats.totalAvailableExercises,
      uniqueCompletedExercises: userStats.uniqueCompletedExercises,
    };

    // Get topics and subtopics completion statistics
    const allTopics = await db
      .select()
      .from(topicsTable)
      .orderBy(topicsTable.order_index);
    const allSubtopics = await db
      .select()
      .from(subtopicsTable)
      .orderBy(subtopicsTable.order_index);

    const completedTopics = await db
      .select({
        topic_id: completedTopicsTable.topic_id,
      })
      .from(completedTopicsTable)
      .where(eq(completedTopicsTable.user_id, userId));

    const completedSubtopics = await db
      .select({
        subtopic_id: completedSubtopicsTable.subtopic_id,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, userId));

    // Create sets for faster lookup
    const completedTopicIds = new Set(completedTopics.map((t) => t.topic_id));
    const completedSubtopicIds = new Set(
      completedSubtopics.map((s) => s.subtopic_id)
    );

    // Find the first uncompleted topic and subtopic
    const firstUncompletedTopic = allTopics.find(
      (topic) => !completedTopicIds.has(topic.id)
    );

    let firstUncompletedSubtopic = null;
    if (firstUncompletedTopic) {
      const topicSubtopics = allSubtopics.filter(
        (s) => s.topic_id === firstUncompletedTopic.id
      );
      firstUncompletedSubtopic = topicSubtopics.find(
        (subtopic) => !completedSubtopicIds.has(subtopic.id)
      );
    }

    // Calculate completion percentages
    const topicsCompletionPercentage =
      allTopics.length > 0
        ? Math.round((completedTopics.length / allTopics.length) * 100)
        : 0;

    const subtopicsCompletionPercentage =
      allSubtopics.length > 0
        ? Math.round((completedSubtopics.length / allSubtopics.length) * 100)
        : 0;

    completionData = {
      totalTopics: allTopics.length,
      completedTopics: completedTopics.length,
      topicsCompletionPercentage,
      totalSubtopics: allSubtopics.length,
      completedSubtopics: completedSubtopics.length,
      subtopicsCompletionPercentage,
      firstUncompletedSubtopic,
      firstUncompletedTopic,
    };
  }

  // Mock motivational quotes
  const quotes = [
    "La costanza è la chiave del successo.",
    "Ogni giorno di studio ti avvicina all'obiettivo.",
    "Non conta quanto vai veloce, l'importante è non fermarsi.",
    "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.",
  ];

  // Random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Build the continue learning URL
  let continueUrl = "/dashboard/teoria";

  if (
    completionData.firstUncompletedTopic &&
    completionData.firstUncompletedSubtopic
  ) {
    continueUrl = `/dashboard/teoria/${completionData.firstUncompletedTopic.id}?subtopic=${completionData.firstUncompletedSubtopic.id}`;
  }

  return {
    userData,
    completionData,
    randomQuote,
    continueUrl,
  };
}
