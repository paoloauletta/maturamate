"use client";

import { useExerciseContext } from "./ExerciseContext";
import { useRouter } from "next/navigation";
import TopicsSidebar from "@/app/components/shared/navigation/topics-sidebar";

interface ExerciseSidebarProps {
  isMobile?: boolean;
}

export default function ExerciseSidebar({
  isMobile = false,
}: ExerciseSidebarProps) {
  const router = useRouter();
  const {
    topics,
    completedTopicIds,
    completedSubtopicIds,
    exerciseProgress,
    activeTopicId,
    activeSubtopicId,
    viewedSubtopicId,
  } = useExerciseContext();

  // Handle navigation when clicking on a topic
  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/esercizi/${topicId}`);
  };

  // Handle navigation when clicking on a subtopic
  const handleSubtopicClick = (subtopicId: string) => {
    // Find the topic that contains this subtopic
    const topic = topics.find((t) =>
      t.subtopics.some((s) => s.id === subtopicId)
    );

    if (topic) {
      // Set a flag to indicate this is a sidebar navigation
      sessionStorage.setItem("sidebar_navigation", "true");

      // Use scroll: false to prevent the default scroll behavior
      router.push(`/dashboard/esercizi/${topic.id}?subtopic=${subtopicId}`, {
        scroll: false,
      });

      // Then manually scroll to the element after a small delay
      setTimeout(() => {
        const element = document.getElementById(subtopicId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <div
      className={
        isMobile
          ? "mb-4"
          : "sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto lg:pb-10 pb-0 pt-4"
      }
    >
      <TopicsSidebar
        topics={topics}
        activeTopicId={activeTopicId}
        activeSubtopicId={viewedSubtopicId || activeSubtopicId}
        onTopicClick={handleTopicClick}
        onSubtopicClick={handleSubtopicClick}
        completedTopicIds={completedTopicIds}
        completedSubtopicIds={completedSubtopicIds}
        readingProgress={exerciseProgress}
        basePath="/dashboard/esercizi"
      />
    </div>
  );
}
