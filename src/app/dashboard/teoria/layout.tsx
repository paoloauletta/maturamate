import { auth } from "@/lib/auth";
import TheoryLayout from "@/app/components/teoria/TheoryLayout";
import { Suspense } from "react";
import { TheorySkeleton } from "@/app/components/shared/loading";
import {
  getCompletedTopics,
  getCompletedSubtopics,
  getTopicsWithSubtopics,
} from "@/utils/topics-subtopics";

export default async function TeoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id as string;

  if (!user) {
    return <Suspense fallback={<TheorySkeleton />}>{children}</Suspense>;
  }

  const completedTopics = await getCompletedTopics(userId);
  const completedSubtopics = await getCompletedSubtopics(userId);

  const topicsWithSubtopics = await getTopicsWithSubtopics();

  // Create a list of completed topics and subtopics IDs, filtering out any null values
  const completedTopicIds = completedTopics
    .map((t) => t.topic_id)
    .filter((id): id is string => id !== null);

  const completedSubtopicIds = completedSubtopics
    .map((s) => s.subtopic_id)
    .filter((id): id is string => id !== null);

  // Use the client-side TheoryLayout component with the server-fetched data
  return (
    <Suspense fallback={<TheorySkeleton />}>
      <TheoryLayout
        topics={topicsWithSubtopics}
        initialCompletedTopics={completedTopicIds}
        initialCompletedSubtopics={completedSubtopicIds}
      >
        {children}
      </TheoryLayout>
    </Suspense>
  );
}
