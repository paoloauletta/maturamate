"use client";

import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SubtopicType {
  id: string;
  name: string;
  order_index: number | null;
}

interface TopicType {
  id: string;
  name: string;
  order_index: number | null;
  subtopics: SubtopicType[];
}

interface TopicsSidebarProps {
  topics: TopicType[];
  activeTopicId?: string;
  activeSubtopicId?: string;
  onTopicClick?: (topicId: string) => void;
  onSubtopicClick?: (subtopicId: string) => void;
  basePath?: string;
  completedTopicIds?: string[];
  completedSubtopicIds?: string[];
}

export default function TopicsSidebar({
  topics,
  activeTopicId,
  activeSubtopicId,
  onTopicClick,
  onSubtopicClick,
  basePath = "/dashboard/teoria",
  completedTopicIds = [],
  completedSubtopicIds = [],
}: TopicsSidebarProps) {
  // Initialize expanded state based on completion
  const initialExpandedState = topics.reduce((acc, topic) => {
    // If the topic is completed, it should be collapsed by default
    const isCompleted = completedTopicIds.includes(topic.id);
    // Only expand if this is the active topic or it's not completed
    acc[topic.id] = activeTopicId === topic.id || !isCompleted;
    return acc;
  }, {} as Record<string, boolean>);

  // Use a ref to avoid infinite loops when expanding topics
  const expandedTopicsRef =
    useRef<Record<string, boolean>>(initialExpandedState);

  // State to track expanded topics
  const [expandedTopics, setExpandedTopics] =
    useState<Record<string, boolean>>(initialExpandedState);

  // This effect ensures completed topics stay collapsed, even after component rerenders
  useEffect(() => {
    // Update the expanded state whenever completedTopicIds changes
    // This ensures completed topics are always collapsed (unless they're active)
    const newExpandedState = { ...expandedTopics };

    // First, collapse all completed topics
    completedTopicIds.forEach((topicId) => {
      if (topicId !== activeTopicId) {
        newExpandedState[topicId] = false;
      }
    });

    // Then, ensure the topic with the active subtopic is expanded
    if (activeSubtopicId) {
      const topicWithActiveSubtopic = topics.find((topic) =>
        topic.subtopics.some((sub) => sub.id === activeSubtopicId)
      );

      if (topicWithActiveSubtopic) {
        newExpandedState[topicWithActiveSubtopic.id] = true;
      }
    }

    // Update state only if there are actual changes
    if (JSON.stringify(newExpandedState) !== JSON.stringify(expandedTopics)) {
      setExpandedTopics(newExpandedState);
    }
  }, [
    completedTopicIds,
    activeTopicId,
    activeSubtopicId,
    topics,
    expandedTopics,
  ]);

  // Toggle topic expansion without navigation
  const toggleTopic = (topicId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any navigation
    e.stopPropagation(); // Prevent event bubbling to parent
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Handle topic click for navigation
  const handleTopicClick = (topicId: string) => {
    if (onTopicClick) {
      onTopicClick(topicId);
    }
  };

  const handleSubtopicClick = (subtopicId: string) => {
    if (onSubtopicClick) {
      onSubtopicClick(subtopicId);
    }
  };

  // Sort topics by order_index
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.order_index === null) return 1;
    if (b.order_index === null) return -1;
    return a.order_index - b.order_index;
  });

  // Find the active topic and subtopic for the mobile menu title
  const activeTopic = activeSubtopicId
    ? topics.find((topic) =>
        topic.subtopics.some((sub) => sub.id === activeSubtopicId)
      )
    : null;

  const activeSubtopic = activeSubtopicId
    ? activeTopic?.subtopics.find((sub) => sub.id === activeSubtopicId)
    : null;

  // Create a state to control the sheet
  const [sheetOpen, setSheetOpen] = useState(false);

  // Handle subtopic click to close the sheet after navigation
  const handleSubtopicClickWithClose = (subtopicId: string) => {
    if (onSubtopicClick) {
      onSubtopicClick(subtopicId);
      setSheetOpen(false);
    }
  };

  const sidebarContent = (
    <div className="w-full h-full">
      <div className="space-y-6">
        {sortedTopics.map((topic) => {
          const isExpanded = expandedTopics[topic.id] || false;
          const isActive = activeTopicId === topic.id;
          const isCompleted = completedTopicIds.includes(topic.id);

          // Sort subtopics by order_index
          const sortedSubtopics = [...topic.subtopics].sort((a, b) => {
            if (a.order_index === null) return 1;
            if (b.order_index === null) return -1;
            return a.order_index - b.order_index;
          });

          return (
            <div key={topic.id} className="mb-2">
              <div
                className={cn(
                  "flex items-center py-2 px-4 text-sm transition-all duration-200 border-l-2",
                  isActive
                    ? "border-l-primary text-primary dark:text-primary"
                    : isCompleted
                    ? "border-l-green-500"
                    : "border-l-transparent hover:border-l-muted hover:text-primary dark:hover:text-bg-primary"
                )}
              >
                {/* Chevron with its own click handler for expanding/collapsing */}
                <div
                  className="cursor-pointer p-1"
                  onClick={(e) => toggleTopic(topic.id, e)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>

                {/* Topic name with its own click handler for navigation */}
                <span
                  className={cn(
                    "truncate cursor-pointer ml-1 font-medium flex items-center",
                    isActive ? "font-bold" : "hover:text-primary"
                  )}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  {topic.order_index !== null ? `${topic.order_index}. ` : ""}
                  {topic.name}
                  {isCompleted && (
                    <CheckCircle className="ml-1.5 h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  )}
                </span>
              </div>

              {isExpanded && sortedSubtopics.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-muted">
                  {sortedSubtopics.map((subtopic) => {
                    const isSubtopicCompleted = completedSubtopicIds.includes(
                      subtopic.id
                    );
                    return (
                      <div
                        key={subtopic.id}
                        className={cn(
                          "cursor-pointer py-1 px-4 text-sm transition-all duration-200 flex items-center border-l-2 -ml-px",
                          activeSubtopicId === subtopic.id
                            ? "border-l-primary text-primary dark:text-primary font-medium"
                            : isSubtopicCompleted
                            ? "border-l-green-500"
                            : "border-l-transparent hover:border-l-muted hover:text-primary dark:hover:text-bg-primary"
                        )}
                        onClick={() =>
                          sheetOpen
                            ? handleSubtopicClickWithClose(subtopic.id)
                            : handleSubtopicClick(subtopic.id)
                        }
                      >
                        <span className="truncate flex items-center">
                          {topic.order_index !== null &&
                          subtopic.order_index !== null
                            ? `${topic.order_index}.${subtopic.order_index} `
                            : ""}
                          {subtopic.name}
                          {isSubtopicCompleted && (
                            <CheckCircle className="ml-1.5 h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {topics.length === 0 && (
        <p className="text-sm text-muted-foreground px-4">
          Nessun argomento disponibile.
        </p>
      )}
    </div>
  );

  // Current topic and subtopic text for mobile display
  const currentTopicText =
    activeSubtopic && activeTopic
      ? `${activeTopic.name} > ${
          activeSubtopic.order_index !== null
            ? `${activeSubtopic.order_index}.`
            : ""
        } ${activeSubtopic.name}`
      : "Seleziona un argomento";

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden w-full mb-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span className="truncate">{currentTopicText}</span>
              <ChevronLeft className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85%] sm:w-[380px] px-0 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <SheetTitle className="sr-only">Menu degli argomenti</SheetTitle>
            <div className="h-full overflow-y-auto py-12">{sidebarContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">{sidebarContent}</div>
    </>
  );
}
