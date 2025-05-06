import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserStatistics, UserStatistics } from "@/lib/data/user-statistics";
import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export interface CompletionData {
  totalTopics: number;
  completedTopics: number;
  topicsCompletionPercentage: number;
  totalSubtopics: number;
  completedSubtopics: number;
  subtopicsCompletionPercentage: number;
  firstUncompletedTopic: any;
  firstUncompletedSubtopic: any;
}

export interface StatisticsData {
  userStats: UserStatistics;
  completionData: CompletionData;
  continueUrl: string;
}

export async function getStatisticsData(): Promise<StatisticsData> {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    redirect("/api/auth/signin");
  }

  // Get user statistics
  const userStats = await getUserStatistics(user.id);

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
    .where(eq(completedTopicsTable.user_id, user.id));

  const completedSubtopics = await db
    .select({
      subtopic_id: completedSubtopicsTable.subtopic_id,
    })
    .from(completedSubtopicsTable)
    .where(eq(completedSubtopicsTable.user_id, user.id));

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

  const completionData = {
    totalTopics: allTopics.length,
    completedTopics: completedTopics.length,
    topicsCompletionPercentage,
    totalSubtopics: allSubtopics.length,
    completedSubtopics: completedSubtopics.length,
    subtopicsCompletionPercentage,
    firstUncompletedTopic,
    firstUncompletedSubtopic,
  };

  // Build the continue learning URL
  let continueUrl = "/dashboard/teoria";
  if (completionData.firstUncompletedTopic) {
    continueUrl = `/dashboard/teoria/${completionData.firstUncompletedTopic.id}`;
    if (completionData.firstUncompletedSubtopic) {
      continueUrl += `?subtopic=${completionData.firstUncompletedSubtopic.id}`;
    }
  }

  return {
    userStats,
    completionData,
    continueUrl,
  };
}
