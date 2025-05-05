import { db } from "@/db/drizzle";
import { topicsTable, subtopicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

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

export interface TopicWithSubtopicsType extends TopicType {
  subtopics: SubtopicType[];
}

/**
 * Get all topics with proper ordering
 */
export const getTopics = cache(async (): Promise<TopicType[]> => {
  const topics = await db
    .select()
    .from(topicsTable)
    .orderBy(topicsTable.order_index);

  return topics;
});

/**
 * Get all subtopics for a specific topic
 */
export const getSubtopics = cache(
  async (topicId: string): Promise<SubtopicType[]> => {
    const subtopics = await db
      .select()
      .from(subtopicsTable)
      .where(eq(subtopicsTable.topic_id, topicId))
      .orderBy(subtopicsTable.order_index);

    return subtopics;
  }
);

/**
 * Get all topics with their related subtopics
 */
export const getTopicsWithSubtopics = cache(
  async (): Promise<TopicWithSubtopicsType[]> => {
    const topics = await getTopics();

    const topicsWithSubtopics: TopicWithSubtopicsType[] = [];

    for (const topic of topics) {
      const subtopics = await getSubtopics(topic.id);
      topicsWithSubtopics.push({
        ...topic,
        subtopics,
      });
    }

    return topicsWithSubtopics;
  }
);
