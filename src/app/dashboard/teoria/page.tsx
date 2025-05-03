import { db } from "@/db/drizzle";
import {
  topicsTable,
  completedTopicsTable,
  completedSubtopicsTable,
  subtopicsTable,
} from "@/db/schema";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { eq, and, not } from "drizzle-orm";

export default async function TheoryPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch all topics ordered by order_index
  const allTopics = await db
    .select()
    .from(topicsTable)
    .orderBy(topicsTable.order_index);

  if (allTopics.length === 0) {
    // If no topics exist, create a placeholder message
    return (
      <Suspense fallback={<LoadingSpinner text="Caricamento teoria..." />}>
        <div className="container text-center">
          <h1 className="text-3xl font-bold mb-4">Teoria</h1>
          <p className="text-muted-foreground">
            Non ci sono ancora argomenti disponibili.
          </p>
        </div>
      </Suspense>
    );
  }

  // Get completed topics for this user
  const completedTopics = await db
    .select({
      topic_id: completedTopicsTable.topic_id,
    })
    .from(completedTopicsTable)
    .where(eq(completedTopicsTable.user_id, user.id as string));

  // Create a set of completed topic IDs for faster lookup
  const completedTopicIds = new Set(completedTopics.map((t) => t.topic_id));

  // Find first uncompleted topic
  const firstUncompletedTopic = allTopics.find(
    (topic) => !completedTopicIds.has(topic.id)
  );

  // If we have an uncompleted topic, let's check its subtopics
  if (firstUncompletedTopic) {
    // Get all subtopics for this topic
    const subtopics = await db
      .select()
      .from(subtopicsTable)
      .where(eq(subtopicsTable.topic_id, firstUncompletedTopic.id))
      .orderBy(subtopicsTable.order_index);

    // Get completed subtopics for this user
    const completedSubtopics = await db
      .select({
        subtopic_id: completedSubtopicsTable.subtopic_id,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, user.id as string));

    // Create a set of completed subtopic IDs for faster lookup
    const completedSubtopicIds = new Set(
      completedSubtopics.map((s) => s.subtopic_id)
    );

    // Find first uncompleted subtopic
    const firstUncompletedSubtopic = subtopics.find(
      (subtopic) => !completedSubtopicIds.has(subtopic.id)
    );

    // If we have an uncompleted subtopic, redirect to it
    if (firstUncompletedSubtopic) {
      redirect(
        `/dashboard/teoria/${firstUncompletedTopic.id}?subtopic=${firstUncompletedSubtopic.id}`
      );
    }

    // If all subtopics are completed but the topic itself isn't, just redirect to the topic
    redirect(`/dashboard/teoria/${firstUncompletedTopic.id}`);
  }

  // If all topics are marked as completed, redirect to the first topic
  redirect(`/dashboard/teoria/${allTopics[0].id}`);
}
