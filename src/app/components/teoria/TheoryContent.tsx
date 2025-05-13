"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/app/components/shared/loading/loading-spinner";
import TheoryHeader from "./TheoryHeader";
import TheorySubtopic from "./TheorySubtopic";
import TheoryNextTopic from "./TheoryNextTopic";
import {
  TopicType,
  SubtopicWithTheoryType,
  TopicWithSubtopicsType,
} from "@/types/theoryTypes";

interface TheoryContentProps {
  currentTopic: TopicType;
  subtopicsWithTheory: SubtopicWithTheoryType[];
  topicsWithSubtopics: TopicWithSubtopicsType[];
  userId: string;
}

export default function TheoryContent({
  currentTopic,
  subtopicsWithTheory,
  topicsWithSubtopics,
  userId,
}: TheoryContentProps) {
  const searchParams = useSearchParams();
  const initialActiveSubtopicId = searchParams.get("subtopic") || undefined;
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  // When the active subtopic changes, scroll to that element
  useEffect(() => {
    if (
      initialActiveSubtopicId &&
      subtopicRefs.current[initialActiveSubtopicId]
    ) {
      subtopicRefs.current[initialActiveSubtopicId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [initialActiveSubtopicId]);

  // Handle scrolling tracking for the sidebar's progress indicators
  useEffect(() => {
    const handleScroll = () => {
      // Scroll tracking logic would go here, but is now handled in the context
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track refs for subtopics to enable scrolling
  const handleSubtopicRef = (id: string, element: HTMLDivElement | null) => {
    subtopicRefs.current[id] = element;
  };

  if (isLoading) {
    return <LoadingSpinner text="Caricamento teoria..." />;
  }

  return (
    <div>
      <TheoryHeader topic={currentTopic} />

      <div className="space-y-12">
        {subtopicsWithTheory.length > 0 ? (
          subtopicsWithTheory.map((subtopic, index) => (
            <TheorySubtopic
              key={subtopic.id}
              topic={currentTopic}
              subtopic={subtopic}
              index={index}
              onRef={handleSubtopicRef}
            />
          ))
        ) : (
          <div className="py-8 text-center bg-muted/20 rounded-lg p-6">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Non ci sono ancora contenuti teorici per questo argomento.
            </p>
          </div>
        )}

        <TheoryNextTopic
          currentTopic={currentTopic}
          topicsWithSubtopics={topicsWithSubtopics}
        />
      </div>
    </div>
  );
}
