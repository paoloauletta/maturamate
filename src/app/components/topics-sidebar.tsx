"use client";

import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
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
}

export default function TopicsSidebar({
  topics,
  activeTopicId,
  activeSubtopicId,
  onTopicClick,
  onSubtopicClick,
}: TopicsSidebarProps) {
  // Initialize all topics as expanded
  const initialExpandedState = topics.reduce((acc, topic) => {
    acc[topic.id] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // State to track expanded topics
  const [expandedTopics, setExpandedTopics] =
    useState<Record<string, boolean>>(initialExpandedState);

  // Update expanded topics if activeSubtopicId changes
  useEffect(() => {
    if (activeSubtopicId) {
      setExpandedTopics((prevState) => {
        const updatedState = { ...prevState };

        topics.forEach((topic) => {
          if (topic.subtopics.some((sub) => sub.id === activeSubtopicId)) {
            updatedState[topic.id] = true;
          }
        });

        return updatedState;
      });
    }
  }, [activeSubtopicId, topics]);

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
                    : "border-l-transparent hover:border-l-muted hover:text-primary dark:hover:text-blue-500"
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
                    "truncate cursor-pointer ml-1 font-medium",
                    isActive ? "font-bold" : "hover:text-primary"
                  )}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  {topic.order_index !== null ? `${topic.order_index}. ` : ""}
                  {topic.name}
                </span>
              </div>

              {isExpanded && sortedSubtopics.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-muted">
                  {sortedSubtopics.map((subtopic) => (
                    <div
                      key={subtopic.id}
                      className={cn(
                        "cursor-pointer py-1 px-4 text-sm transition-all duration-200 flex items-center border-l-2 -ml-px",
                        activeSubtopicId === subtopic.id
                          ? "border-l-primary text-primary dark:text-primary font-medium"
                          : "border-l-transparent hover:border-l-muted hover:text-primary dark:hover:text-blue-500"
                      )}
                      onClick={() =>
                        sheetOpen
                          ? handleSubtopicClickWithClose(subtopic.id)
                          : handleSubtopicClick(subtopic.id)
                      }
                    >
                      <span className="truncate">
                        {topic.order_index !== null &&
                        subtopic.order_index !== null
                          ? `${topic.order_index}.${subtopic.order_index} `
                          : ""}
                        {subtopic.name}
                      </span>
                    </div>
                  ))}
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
              <Menu className="h-4 w-4 ml-2 flex-shrink-0" />
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
