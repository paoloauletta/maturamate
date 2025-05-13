"use client";

import { useTheoryContext } from "./TheoryContext";
import { useRouter } from "next/navigation";
import TopicsSidebar from "@/app/components/shared/navigation/topics-sidebar";

interface TheorySidebarProps {
  isMobile?: boolean;
}

export default function TheorySidebar({
  isMobile = false,
}: TheorySidebarProps) {
  const router = useRouter();
  const {
    topics,
    completedTopicIds,
    completedSubtopicIds,
    readingProgress,
    activeTopicId,
    activeSubtopicId,
  } = useTheoryContext();

  // Handle navigation when clicking on a topic
  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/teoria/${topicId}`);
  };

  // Handle navigation when clicking on a subtopic
  const handleSubtopicClick = (subtopicId: string) => {
    // Find the topic that contains this subtopic
    const topic = topics.find((t) =>
      t.subtopics.some((s) => s.id === subtopicId)
    );

    if (topic) {
      router.push(`/dashboard/teoria/${topic.id}?subtopic=${subtopicId}`);
    }
  };

  return (
    <div
      className={
        isMobile
          ? "mb-4"
          : "sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto lg:pb-10 pb-0"
      }
    >
      <TopicsSidebar
        topics={topics}
        activeTopicId={activeTopicId}
        activeSubtopicId={activeSubtopicId}
        onTopicClick={handleTopicClick}
        onSubtopicClick={handleSubtopicClick}
        completedTopicIds={completedTopicIds}
        completedSubtopicIds={completedSubtopicIds}
        readingProgress={readingProgress}
      />
    </div>
  );
}
