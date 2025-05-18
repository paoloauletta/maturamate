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
  readingProgress?: Record<string, number>;
  topMargin?: string;
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
  readingProgress = {},
  topMargin = "",
}: TopicsSidebarProps) {
  // Initialize expanded state based on active topic or if topic contains active subtopic
  const initialExpandedState = topics.reduce((acc, topic) => {
    // Determine if this topic contains the active subtopic
    const containsActiveSubtopic = activeSubtopicId
      ? topic.subtopics.some((sub) => sub.id === activeSubtopicId)
      : false;

    // Expand if this is the active topic or contains the active subtopic
    acc[topic.id] = activeTopicId === topic.id || containsActiveSubtopic;
    return acc;
  }, {} as Record<string, boolean>);

  // Use a ref to avoid infinite loops when expanding topics
  const expandedTopicsRef =
    useRef<Record<string, boolean>>(initialExpandedState);

  // State to track expanded topics
  const [expandedTopics, setExpandedTopics] =
    useState<Record<string, boolean>>(initialExpandedState);

  // Track whether a topic has been manually toggled
  const [manuallyToggled, setManuallyToggled] = useState<
    Record<string, boolean>
  >({});

  // This effect ensures only the active topic is expanded, but respects manual toggles
  useEffect(() => {
    // Only manage the automatic state when topics or active topic changes
    const newExpandedState = { ...expandedTopics };

    // First, collapse all topics that haven't been manually toggled
    topics.forEach((topic) => {
      if (!manuallyToggled[topic.id]) {
        newExpandedState[topic.id] = false;
      }
    });

    // Then, expand the active topic if it hasn't been manually toggled
    if (activeTopicId && !manuallyToggled[activeTopicId]) {
      newExpandedState[activeTopicId] = true;
    }

    // Finally, ensure the topic with the active subtopic is expanded if it hasn't been manually toggled
    if (activeSubtopicId) {
      const topicWithActiveSubtopic = topics.find((topic) =>
        topic.subtopics.some((sub) => sub.id === activeSubtopicId)
      );

      if (
        topicWithActiveSubtopic &&
        !manuallyToggled[topicWithActiveSubtopic.id]
      ) {
        newExpandedState[topicWithActiveSubtopic.id] = true;
      }
    }

    // Update state only if there are actual changes
    if (JSON.stringify(newExpandedState) !== JSON.stringify(expandedTopics)) {
      setExpandedTopics(newExpandedState);
    }
  }, [
    activeTopicId,
    activeSubtopicId,
    topics,
    expandedTopics,
    manuallyToggled,
  ]);

  // Toggle topic expansion without navigation
  const toggleTopic = (topicId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any navigation
    e.stopPropagation(); // Prevent event bubbling to parent

    // Mark this topic as manually toggled
    setManuallyToggled((prev) => ({ ...prev, [topicId]: true }));

    // Toggle the expansion state
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
      <div className={`space-y-6 ${topMargin}`}>
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
                    "cursor-pointer ml-1 font-medium flex items-center justify-between w-full",
                    isActive ? "font-bold" : "hover:text-primary"
                  )}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <span className="break-words w-full pr-2">
                    {topic.order_index !== null ? `${topic.order_index}. ` : ""}
                    {topic.name}
                  </span>
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
                    const progress = readingProgress[subtopic.id] || 0;

                    // Create CSS classes based on state instead of complex inline styles
                    const subtopicClasses = cn(
                      "cursor-pointer py-1 px-4 text-sm transition-all duration-200 flex items-center -ml-px relative",
                      activeSubtopicId === subtopic.id
                        ? "text-foreground dark:text-foreground font-bold"
                        : "hover:text-foreground dark:hover:text-bg-foreground"
                    );

                    return (
                      <div
                        key={subtopic.id}
                        className={subtopicClasses}
                        onClick={() =>
                          sheetOpen
                            ? handleSubtopicClickWithClose(subtopic.id)
                            : handleSubtopicClick(subtopic.id)
                        }
                      >
                        {/* Left border indicator */}
                        {isSubtopicCompleted ? (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />
                        ) : activeSubtopicId === subtopic.id ? (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5">
                            <div
                              className="bg-primary"
                              style={{
                                height: `${progress}%`,
                                width: "100%",
                              }}
                            />
                          </div>
                        ) : progress > 0 ? (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5">
                            <div
                              className="bg-muted-foreground/40"
                              style={{
                                height: `${progress}%`,
                                width: "100%",
                              }}
                            />
                          </div>
                        ) : null}

                        <span className="flex items-center justify-between w-full">
                          <span className="break-words w-full">
                            {topic.order_index !== null &&
                            subtopic.order_index !== null
                              ? `${topic.order_index}.${subtopic.order_index} `
                              : ""}
                            {subtopic.name}
                          </span>
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
      ? `${activeTopic.name}`
      : "Seleziona un argomento";

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden w-full mb-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span className="truncate max-w-[90%]">{currentTopicText}</span>
              <ChevronLeft className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[380px] px-0 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <SheetTitle className="sr-only">Menu degli argomenti</SheetTitle>
            <div className="h-full overflow-y-auto py-12 px-4 sm:px-0">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">{sidebarContent}</div>
    </>
  );
}
