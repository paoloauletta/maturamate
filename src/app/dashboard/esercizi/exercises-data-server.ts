import { db } from "@/db/drizzle";
import {
  exercisesTable,
  topicsTable,
  subtopicsTable,
  exercisesCardsTable,
  completedExercisesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getTopics } from "@/utils/cache";

export async function getExercisesData() {
  const session = await auth();

  // Check if user is authenticated and redirect if not
  if (!session?.user?.id) {
    return { firstTopic: null };
  }

  // Get all topics
  const topics = await getTopics();

  // If there are topics, return the ID of the first one
  if (topics.length > 0) {
    // Sort topics by order_index if available
    const sortedTopics = [...topics].sort((a, b) => {
      if (a.order_index !== null && b.order_index !== null) {
        return a.order_index - b.order_index;
      } else if (a.order_index !== null) {
        return -1;
      } else if (b.order_index !== null) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return {
      firstTopic: sortedTopics[0].id,
    };
  }

  // No topics available
  return { firstTopic: null };
}
