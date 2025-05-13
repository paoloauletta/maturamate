"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SidebarTopicType } from "@/types/theoryTypes";

interface TheoryContextProps {
  topics: SidebarTopicType[];
  completedTopicIds: string[];
  completedSubtopicIds: string[];
  readingProgress: Record<string, number>;
  activeTopicId?: string;
  activeSubtopicId?: string;
  updateCompletedTopic: (topicId: string) => void;
  updateCompletedSubtopic: (subtopicId: string) => void;
  updateReadingProgress: (subtopicId: string, progress: number) => void;
}

const TheoryContext = createContext<TheoryContextProps | undefined>(undefined);

export function useTheoryContext() {
  const context = useContext(TheoryContext);
  if (!context) {
    throw new Error("useTheoryContext must be used within a TheoryProvider");
  }
  return context;
}

interface TheoryProviderProps {
  children: ReactNode;
  topics: SidebarTopicType[];
  initialCompletedTopics: string[];
  initialCompletedSubtopics: string[];
  activeTopicId?: string;
  activeSubtopicId?: string;
}

export function TheoryProvider({
  children,
  topics,
  initialCompletedTopics,
  initialCompletedSubtopics,
  activeTopicId,
  activeSubtopicId,
}: TheoryProviderProps) {
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(
    initialCompletedTopics
  );
  const [completedSubtopicIds, setCompletedSubtopicIds] = useState<string[]>(
    initialCompletedSubtopics
  );
  const [readingProgress, setReadingProgress] = useState<
    Record<string, number>
  >({});

  // Fetch completion status from API on mount - optimized version
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        // Fetch all completion statuses in a single API call
        const resp = await fetch(`/api/user/completion-bulk`);

        if (resp.ok) {
          const data = await resp.json();

          if (data.completedTopics && Array.isArray(data.completedTopics)) {
            setCompletedTopicIds(data.completedTopics);
          }

          if (
            data.completedSubtopics &&
            Array.isArray(data.completedSubtopics)
          ) {
            setCompletedSubtopicIds(data.completedSubtopics);
          }
        }
      } catch (error) {
        console.error("Failed to fetch completion status:", error);
      }
    };

    fetchCompletionStatus();
  }, []);

  const updateCompletedTopic = (topicId: string) => {
    if (!completedTopicIds.includes(topicId)) {
      setCompletedTopicIds([...completedTopicIds, topicId]);
    }
  };

  const updateCompletedSubtopic = (subtopicId: string) => {
    if (!completedSubtopicIds.includes(subtopicId)) {
      setCompletedSubtopicIds([...completedSubtopicIds, subtopicId]);
    }
  };

  const updateReadingProgress = (subtopicId: string, progress: number) => {
    setReadingProgress((prev) => {
      if (progress > (prev[subtopicId] || 0)) {
        return { ...prev, [subtopicId]: progress };
      }
      return prev;
    });
  };

  const value = {
    topics,
    completedTopicIds,
    completedSubtopicIds,
    readingProgress,
    activeTopicId,
    activeSubtopicId,
    updateCompletedTopic,
    updateCompletedSubtopic,
    updateReadingProgress,
  };

  return (
    <TheoryContext.Provider value={value}>{children}</TheoryContext.Provider>
  );
}
