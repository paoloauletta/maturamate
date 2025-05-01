"use client";

import { useEffect, useRef, useState } from "react";
import TopicsSidebar from "@/app/components/topics-sidebar";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/app/components/markdownRenderer";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseCard from "@/app/components/exercises/ExerciseCard";

// Theory content types
interface TheoryContentType {
  id: string;
  subtopic_id: string;
  content: string;
}

// Exercise card types
interface ExerciseCardType {
  id: string;
  subtopic_id: string | null;
  description: string;
  difficulty: number;
  total_exercises: number;
  completed_exercises: number;
  is_completed: boolean;
}

interface SubtopicWithTheoryType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
  theory: TheoryContentType[];
  exercise_cards: ExerciseCardType[];
}

// Types for sidebar
interface SidebarSubtopicType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
}

interface SidebarTopicType {
  id: string;
  name: string;
  description: string | null;
  order_index: number | null;
  subtopics: SidebarSubtopicType[];
}

interface TopicType {
  id: string;
  name: string;
  description: string | null;
  order_index: number | null;
}

interface TopicClientProps {
  currentTopic: TopicType;
  topicsWithSubtopics: SidebarTopicType[];
  subtopicsWithTheory: SubtopicWithTheoryType[];
  activeSubtopicId?: string;
  userId: string;
}

export default function TopicClient({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithTheory,
  activeSubtopicId: initialActiveSubtopicId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
}: TopicClientProps) {
  const router = useRouter();
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Use local state to manage active subtopic ID
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | undefined>(
    initialActiveSubtopicId
  );

  // Handle navigation when clicking on a topic
  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/teoria/${topicId}`);
  };

  // Handle navigation when clicking on a subtopic
  const handleSubtopicClick = (subtopicId: string, topicId: string) => {
    // If we're already on the correct topic page, just scroll to the subtopic
    if (topicId === currentTopic.id) {
      // Update local state to trigger UI updates in this component and sidebar
      setActiveSubtopicId(subtopicId);

      // Scroll to the subtopic element
      const subtopicElement = subtopicRefs.current[subtopicId];
      if (subtopicElement) {
        subtopicElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Update URL without a full navigation
      const url = new URL(window.location.href);
      url.searchParams.set("subtopic", subtopicId);
      window.history.pushState({}, "", url.toString());
    } else {
      // Navigate to the appropriate topic page with subtopic in query
      router.push(`/dashboard/teoria/${topicId}?subtopic=${subtopicId}`);
    }
  };

  // Scroll to the active subtopic if provided in URL
  useEffect(() => {
    if (activeSubtopicId && subtopicRefs.current[activeSubtopicId]) {
      subtopicRefs.current[activeSubtopicId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeSubtopicId]);

  return (
    <div className="container">
      {/* Mobile Topic Menu - Show above topic name on mobile */}
      <div className="block md:hidden mb-4">
        <TopicsSidebar
          topics={topicsWithSubtopics}
          activeTopicId={currentTopic.id}
          activeSubtopicId={activeSubtopicId}
          onTopicClick={handleTopicClick}
          onSubtopicClick={(subtopicId) => {
            // Find the topic that contains this subtopic
            const topic = topicsWithSubtopics.find((t) =>
              t.subtopics?.some((s) => s.id === subtopicId)
            );
            if (topic) {
              handleSubtopicClick(subtopicId, topic.id);
            }
          }}
        />
      </div>

      <h1 className="text-4xl font-bold text-left flex justify-between items-center mb-8 border-b pb-4 border-border">
        {currentTopic.order_index !== null
          ? `${currentTopic.order_index}. `
          : ""}
        {currentTopic.name}
      </h1>

      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-3/4 space-y-12 md:border-r md:border-muted md:pr-8">
          {subtopicsWithTheory.length > 0 ? (
            subtopicsWithTheory.map((subtopic, index) => (
              <div
                key={subtopic.id}
                ref={(el) => {
                  if (el) subtopicRefs.current[subtopic.id] = el;
                }}
                id={subtopic.id}
                className="scroll-mt-16"
              >
                {/* Add divider between subtopics except for the first one */}
                {index > 0 && (
                  <div className="my-10 border-t border-gray-200 dark:border-gray-800" />
                )}

                <div className="mb-6">
                  <h2 className="text-3xl font-semibold mb-6 text-foreground/95 border-b border-muted pb-2">
                    {currentTopic.order_index !== null &&
                    subtopic.order_index !== null
                      ? `${currentTopic.order_index}.${subtopic.order_index} `
                      : ""}
                    {subtopic.name}
                  </h2>
                  {subtopic.theory.length > 0 ? (
                    <div className="space-y-10">
                      {subtopic.theory.map((theory) => (
                        <div key={theory.id} className="space-y-4">
                          <div className="prose max-w-none dark:prose-invert">
                            <MarkdownRenderer
                              content={
                                Array.isArray(theory.content)
                                  ? theory.content
                                  : typeof theory.content === "string"
                                  ? theory.content.startsWith("[") &&
                                    theory.content.endsWith("]")
                                    ? JSON.parse(theory.content)
                                    : theory.content
                                  : theory.content
                              }
                              className="theory-content prose-headings:mt-6 prose-headings:mb-4 prose-p:my-4 prose-ul:my-4 prose-ol:my-4"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Exercise Preview Section */}
                      {subtopic.exercise_cards.length > 0 && (
                        <div className="mt-16 border-t pt-8">
                          <div className="relative overflow-hidden rounded-lg p-1">
                            {/* Card carousel showing partial next card based on screen size */}
                            <div className="flex space-x-4 pr-3 w-full overflow-x-visible">
                              {/* First card (always visible on all screens) */}
                              {subtopic.exercise_cards.length > 0 && (
                                <div className="w-full min-w-full md:min-w-[calc(50%-8px)] md:w-[calc(50%-8px)] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
                                  <ExerciseCard
                                    id={subtopic.exercise_cards[0].id}
                                    topicName={currentTopic.name}
                                    topicOrder={currentTopic.order_index}
                                    subtopicName={subtopic.name}
                                    subtopicOrder={subtopic.order_index}
                                    description={
                                      subtopic.exercise_cards[0].description
                                    }
                                    difficulty={
                                      subtopic.exercise_cards[0].difficulty
                                    }
                                    isCompleted={
                                      subtopic.exercise_cards[0].is_completed
                                    }
                                    totalExercises={
                                      subtopic.exercise_cards[0].total_exercises
                                    }
                                    completedExercises={
                                      subtopic.exercise_cards[0]
                                        .completed_exercises
                                    }
                                  />
                                </div>
                              )}

                              {/* Second card (glimpse on mobile, full on tablet/desktop) */}
                              {subtopic.exercise_cards.length > 1 && (
                                <div className="min-w-[30%] w-[30%] md:min-w-[calc(50%-8px)] md:w-[calc(50%-8px)] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
                                  <ExerciseCard
                                    id={subtopic.exercise_cards[1].id}
                                    topicName={currentTopic.name}
                                    topicOrder={currentTopic.order_index}
                                    subtopicName={subtopic.name}
                                    subtopicOrder={subtopic.order_index}
                                    description={
                                      subtopic.exercise_cards[1].description
                                    }
                                    difficulty={
                                      subtopic.exercise_cards[1].difficulty
                                    }
                                    isCompleted={
                                      subtopic.exercise_cards[1].is_completed
                                    }
                                    totalExercises={
                                      subtopic.exercise_cards[1].total_exercises
                                    }
                                    completedExercises={
                                      subtopic.exercise_cards[1]
                                        .completed_exercises
                                    }
                                  />
                                </div>
                              )}

                              {/* Third card (only visible on tablet+ with glimpse on tablet, full on desktop) */}
                              {subtopic.exercise_cards.length > 2 && (
                                <div className="hidden md:block md:min-w-[30%] md:w-[30%] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
                                  <ExerciseCard
                                    id={subtopic.exercise_cards[2].id}
                                    topicName={currentTopic.name}
                                    topicOrder={currentTopic.order_index}
                                    subtopicName={subtopic.name}
                                    subtopicOrder={subtopic.order_index}
                                    description={
                                      subtopic.exercise_cards[2].description
                                    }
                                    difficulty={
                                      subtopic.exercise_cards[2].difficulty
                                    }
                                    isCompleted={
                                      subtopic.exercise_cards[2].is_completed
                                    }
                                    totalExercises={
                                      subtopic.exercise_cards[2].total_exercises
                                    }
                                    completedExercises={
                                      subtopic.exercise_cards[2]
                                        .completed_exercises
                                    }
                                  />
                                </div>
                              )}

                              {/* Fourth card (only glimpse on desktop) */}
                              {subtopic.exercise_cards.length > 3 && (
                                <div className="hidden lg:block lg:min-w-[25%] lg:w-[25%]">
                                  <ExerciseCard
                                    id={subtopic.exercise_cards[3].id}
                                    topicName={currentTopic.name}
                                    topicOrder={currentTopic.order_index}
                                    subtopicName={subtopic.name}
                                    subtopicOrder={subtopic.order_index}
                                    description={
                                      subtopic.exercise_cards[3].description
                                    }
                                    difficulty={
                                      subtopic.exercise_cards[3].difficulty
                                    }
                                    isCompleted={
                                      subtopic.exercise_cards[3].is_completed
                                    }
                                    totalExercises={
                                      subtopic.exercise_cards[3].total_exercises
                                    }
                                    completedExercises={
                                      subtopic.exercise_cards[3]
                                        .completed_exercises
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* Gradient overlay based on number of cards - responsive with CSS */}
                            {subtopic.exercise_cards.length > 1 && (
                              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pointer-events-none">
                                {/* Main gradient overlay - light and dark mode compatible */}
                                <div className="absolute inset-y-0 right-0 w-[100px] md:w-[120px] lg:w-[160px]">
                                  {/* Light mode gradient */}
                                  <div
                                    className="absolute inset-0 dark:hidden"
                                    style={{
                                      background: `linear-gradient(90deg, 
                                        rgba(255, 255, 255, 0) 0%, 
                                        rgba(255, 255, 255, 0.7) 50%, 
                                        rgba(255, 255, 255, 0.95) 100%)`,
                                    }}
                                  />
                                  {/* Dark mode gradient */}
                                  <div
                                    className="absolute inset-0 hidden dark:block"
                                    style={{
                                      background: `linear-gradient(90deg, 
                                        rgba(27, 27, 27, 0) 0%, 
                                        rgba(27, 27, 27, 0.7) 50%, 
                                        rgba(27, 27, 27, 0.95) 100%)`,
                                    }}
                                  />
                                </div>

                                {/* Counter badge as clickable link - Responsive for different screen sizes */}
                                <Link
                                  href={`/dashboard/esercizi?subtopic=${subtopic.id}`}
                                  className="relative z-10 mr-4 md:mr-6 lg:mr-8 bg-muted/80 hover:bg-muted rounded-full py-2 px-3 px-4 backdrop-blur-sm border border-border cursor-pointer transition-colors duration-200 pointer-events-auto"
                                >
                                  <span className="text-xs md:text-sm font-medium flex items-center">
                                    {/* Mobile */}
                                    <span className="md:hidden">
                                      +{subtopic.exercise_cards.length - 1}
                                    </span>
                                    {/* Tablet */}
                                    <span className="hidden md:inline lg:hidden">
                                      +{subtopic.exercise_cards.length - 2}
                                    </span>
                                    {/* Desktop */}
                                    <span className="hidden lg:inline">
                                      +{subtopic.exercise_cards.length - 3}
                                    </span>
                                    <span className="ml-1">altri</span>
                                    <ChevronRight className="ml-1 h-3 w-3 opacity-70" />
                                  </span>
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Exercise Button */}
                          {subtopic.exercise_cards.length > 0 && (
                            <div className="flex justify-start mt-8 p-1">
                              <Link
                                href={`/dashboard/esercizi?subtopic=${subtopic.id}`}
                              >
                                <Button
                                  className="group px-8 py-6 text-white cursor-pointer"
                                  variant="default"
                                  size="lg"
                                >
                                  <span>Esercitati su questo argomento</span>
                                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Non ci sono ancora contenuti teorici per questo argomento.
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-lg p-6">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Non ci sono ancora contenuti teorici per questo argomento.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar (only shown on desktop) */}
        <div className="hidden md:block md:w-1/4 relative">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto lg:pb-10 pb-0">
            <TopicsSidebar
              topics={topicsWithSubtopics}
              activeTopicId={currentTopic.id}
              activeSubtopicId={activeSubtopicId}
              onTopicClick={handleTopicClick}
              onSubtopicClick={(subtopicId) => {
                // Find the topic that contains this subtopic
                const topic = topicsWithSubtopics.find((t) =>
                  t.subtopics?.some((s) => s.id === subtopicId)
                );
                if (topic) {
                  handleSubtopicClick(subtopicId, topic.id);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
