import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get all topics and count
    const allTopics = await db
      .select()
      .from(topicsTable)
      .orderBy(topicsTable.order_index);
    const totalTopics = allTopics.length;

    // Get all subtopics and count
    const allSubtopics = await db
      .select()
      .from(subtopicsTable)
      .orderBy(subtopicsTable.order_index);
    const totalSubtopics = allSubtopics.length;

    // Get completed topics for this user
    const completedTopics = await db
      .select({
        topic_id: completedTopicsTable.topic_id,
        created_at: completedTopicsTable.created_at,
      })
      .from(completedTopicsTable)
      .where(eq(completedTopicsTable.user_id, user.id))
      .orderBy(completedTopicsTable.created_at);

    // Get completed subtopics for this user
    const completedSubtopics = await db
      .select({
        subtopic_id: completedSubtopicsTable.subtopic_id,
        created_at: completedSubtopicsTable.created_at,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, user.id))
      .orderBy(completedSubtopicsTable.created_at);

    // Create a map of completed topic IDs for easier lookup
    const completedTopicIds = new Set(completedTopics.map((t) => t.topic_id));

    // Create a map of completed subtopic IDs for easier lookup
    const completedSubtopicIds = new Set(
      completedSubtopics.map((s) => s.subtopic_id)
    );

    // For each topic, include whether it's completed and its subtopics
    const topicsWithCompletionStatus = allTopics.map((topic) => {
      const topicSubtopics = allSubtopics.filter(
        (s) => s.topic_id === topic.id
      );
      const isCompleted = completedTopicIds.has(topic.id);

      return {
        ...topic,
        is_completed: isCompleted,
        subtopics: topicSubtopics.map((subtopic) => ({
          ...subtopic,
          is_completed: completedSubtopicIds.has(subtopic.id),
        })),
      };
    });

    // Find the first uncompleted topic in order
    const firstUncompletedTopic = allTopics.find(
      (topic) => !completedTopicIds.has(topic.id)
    );

    // Find the first uncompleted subtopic in order
    let firstUncompletedSubtopic = null;
    if (firstUncompletedTopic) {
      const topicSubtopics = allSubtopics.filter(
        (s) => s.topic_id === firstUncompletedTopic.id
      );
      firstUncompletedSubtopic = topicSubtopics.find(
        (subtopic) => !completedSubtopicIds.has(subtopic.id)
      );
    } else {
      // If all topics are completed, check if there are any uncompleted subtopics
      firstUncompletedSubtopic = allSubtopics.find(
        (subtopic) => !completedSubtopicIds.has(subtopic.id)
      );
    }

    // Calculate completion percentages
    const topicsCompletionPercentage =
      totalTopics > 0
        ? Math.round((completedTopics.length / totalTopics) * 100)
        : 0;

    const subtopicsCompletionPercentage =
      totalSubtopics > 0
        ? Math.round((completedSubtopics.length / totalSubtopics) * 100)
        : 0;

    return NextResponse.json({
      totalTopics,
      completedTopics: completedTopics.length,
      topicsCompletionPercentage,
      totalSubtopics,
      completedSubtopics: completedSubtopics.length,
      subtopicsCompletionPercentage,
      topicsWithCompletionStatus,
      firstUncompletedTopic,
      firstUncompletedSubtopic,
      completedTopicIds: Array.from(completedTopicIds),
      completedSubtopicIds: Array.from(completedSubtopicIds),
    });
  } catch (error) {
    console.error("Error getting completion status:", error);
    return NextResponse.json(
      { error: "Failed to get completion status" },
      { status: 500 }
    );
  }
}
