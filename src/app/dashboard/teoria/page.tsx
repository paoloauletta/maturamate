import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { subtopicsTable } from "@/db/schema";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TheorySkeleton } from "@/app/components/shared/loading";

import {
  getAllTopics,
  getCompletedTopics,
  getCompletedSubtopics,
} from "@/utils/topics-subtopics";

export default function TheoryPageWrapper() {
  return (
    <Suspense fallback={<TheorySkeleton />}>
      <TheoryPage />
    </Suspense>
  );
}

async function TheoryPage() {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id as string;

  if (!user) {
    redirect("/api/auth/login");
  }

  const allTopics = await getAllTopics();

  if (allTopics.length === 0) {
    // If no topics exist, create a placeholder message
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Teoria</h1>
        <p className="text-muted-foreground">
          Non ci sono ancora argomenti disponibili.
        </p>
      </div>
    );
  }

  // Use completedTopicIds only
  const completedTopics = await getCompletedTopics(userId);
  const completedSubtopics = await getCompletedSubtopics(userId);

  // Create a set of completed topic and subtopics IDs for faster lookup
  const completedTopicIds = completedTopics.map((t) => t.topic_id);
  const completedSubtopicIds = completedSubtopics.map((s) => s.subtopic_id);

  // Find first uncompleted topic
  const firstUncompletedTopic = allTopics.find(
    (topic) => !completedTopicIds.includes(topic.id),
  );

  // If we have an uncompleted topic, let's check its subtopics
  if (firstUncompletedTopic) {
    // Get all subtopics for this topic
    const subtopics = await db
      .select()
      .from(subtopicsTable)
      .where(eq(subtopicsTable.topic_id, firstUncompletedTopic.id))
      .orderBy(subtopicsTable.order_index);

    // Find first uncompleted subtopic
    const firstUncompletedSubtopic = subtopics.find(
      (subtopic) => !completedSubtopicIds.includes(subtopic.id),
    );

    // If we have an uncompleted subtopic, redirect to it
    if (firstUncompletedSubtopic) {
      redirect(
        `/dashboard/teoria/${firstUncompletedTopic.id}?subtopic=${firstUncompletedSubtopic.id}`,
      );
    }

    // If all subtopics are completed but the topic itself isn't, just redirect to the topic
    redirect(`/dashboard/teoria/${firstUncompletedTopic.id}`);
  }

  // If all topics are marked as completed, redirect to the first topic
  redirect(`/dashboard/teoria/${allTopics[0].id}`);
}
