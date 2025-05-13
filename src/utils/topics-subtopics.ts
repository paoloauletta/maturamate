import { cache } from "react";
import { db } from "@/db/drizzle";
import {
  topicsTable,
  subtopicsTable,
  completedTopicsTable,
  completedSubtopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { revalidate } from "@/app/dashboard/simulazioni/[id]/solutions/page";

// Cache topics with improved tagging and longer duration
export const getAllTopics = cache(async () => {
  return db.select().from(topicsTable).orderBy(topicsTable.order_index);
});

// Cache all subtopics (useful for navigation)
export const getAllSubtopics = cache(async () => {
  return db.select().from(subtopicsTable).orderBy(subtopicsTable.order_index);
});

// Improved subtopics caching with proper tags
export const getSubtopicsByTopic = cache(async (topicId: string) => {
  return db
    .select()
    .from(subtopicsTable)
    .where(eq(subtopicsTable.topic_id, topicId))
    .orderBy(subtopicsTable.order_index);
});

// Cache topics with subtopics - for navigation structure
export const getTopicsWithSubtopics = cache(async () => {
  const topics = await getAllTopics();
  const subtopics = await getAllSubtopics();

  return topics.map((topic) => ({
    ...topic,
    subtopics: subtopics.filter((s) => s.topic_id === topic.id),
  }));
});

// Get completed topics for the currently authenticated user
export const getCompletedTopics = unstable_cache(
  async (userId: string) => {
    const completedTopics = await db
      .select({
        topic_id: completedTopicsTable.topic_id,
      })
      .from(completedTopicsTable)
      .where(eq(completedTopicsTable.user_id, userId as string));

    return completedTopics;
  },
  ["user-completed-subtopics"],

  { revalidate: 60 },
);

// Get completed topics for the currently authenticated user
export const getCompletedSubtopics = unstable_cache(
  async (userId: string) => {
    const completedTopics = await db
      .select({
        subtopic_id: completedSubtopicsTable.subtopic_id,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, userId as string));

    return completedTopics;
  },
  ["user-completed-subtopics"],

  { revalidate: 60 },
);
