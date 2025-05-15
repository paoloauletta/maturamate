"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExerciseCard from "@/app/components/shared/exercises/ExerciseCard";
import MobileExerciseItem from "@/app/components/shared/exercises/MobileExerciseCard";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseTopicClientProps } from "@/types/exercisesTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExerciseFilters } from "@/hooks/use-exercise-filters";
import DifficultyCompletionFilter from "@/app/components/esercizi/ExerciseFilter";
import ExerciseHeader from "@/app/components/esercizi/ExerciseHeader";
import { ExerciseProvider, useExerciseContext } from "./ExerciseContext";
import ExerciseSidebar from "./ExerciseSidebar";
import { SidebarTopicType } from "@/types/theoryTypes";

export default function TopicExercisesPage({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithExercises,
  activeSubtopicId: initialActiveSubtopicId,
  userId,
}: ExerciseTopicClientProps) {
  // Convert topicsWithSubtopics to the format expected by the ExerciseProvider
  const formattedTopics: SidebarTopicType[] = topicsWithSubtopics.map(
    (topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description || null,
      order_index: topic.order_index,
      subtopics: topic.subtopics.map((subtopic) => ({
        id: subtopic.id,
        name: subtopic.name,
        order_index: subtopic.order_index,
        topic_id: subtopic.topic_id,
      })),
    })
  );

  // Get info about completed topics and subtopics
  const completedTopicIds = topicsWithSubtopics
    .filter((topic) => {
      const subtopicsForTopic = subtopicsWithExercises.filter(
        (s) => s.topic_id === topic.id
      );
      const allSubtopicsCompleted = subtopicsForTopic.every((subtopic) => {
        return subtopic.exercise_cards.every((card) => card.is_completed);
      });
      return allSubtopicsCompleted && subtopicsForTopic.length > 0;
    })
    .map((topic) => topic.id);

  const completedSubtopicIds = subtopicsWithExercises
    .filter((subtopic) => {
      return subtopic.exercise_cards.every((card) => card.is_completed);
    })
    .map((subtopic) => subtopic.id);

  return (
    <ExerciseProvider
      topics={formattedTopics}
      initialCompletedTopics={completedTopicIds}
      initialCompletedSubtopics={completedSubtopicIds}
      activeTopicId={currentTopic.id}
      activeSubtopicId={initialActiveSubtopicId}
    >
      <ExercisesContent
        currentTopic={currentTopic}
        topicsWithSubtopics={topicsWithSubtopics}
        subtopicsWithExercises={subtopicsWithExercises}
        initialActiveSubtopicId={initialActiveSubtopicId}
      />
    </ExerciseProvider>
  );
}

function ExercisesContent({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithExercises,
  initialActiveSubtopicId,
}: Omit<ExerciseTopicClientProps, "userId"> & {
  initialActiveSubtopicId?: string;
}) {
  const router = useRouter();
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { updateViewedSubtopic } = useExerciseContext();

  // States
  const { isMobile, mounted } = useIsMobile();
  const { filterState, handleFilterChange, clearFilters, filterCard } =
    useExerciseFilters();

  // Function to find next topic
  const findNextTopic = () => {
    // If currentTopic doesn't have an order_index, return the first topic
    if (currentTopic.order_index === null) {
      return topicsWithSubtopics[0]?.id;
    }

    // Sort topics by order_index
    const sortedTopics = [...topicsWithSubtopics].sort((a, b) => {
      if (a.order_index === null) return 1;
      if (b.order_index === null) return -1;
      return a.order_index - b.order_index;
    });

    // Find the index of the current topic
    const currentIndex = sortedTopics.findIndex(
      (t) => t.id === currentTopic.id
    );

    // Return the next topic, or the first one if we're at the end
    if (currentIndex < sortedTopics.length - 1) {
      return sortedTopics[currentIndex + 1].id;
    }

    return null; // No next topic available (we're at the last one)
  };

  // Get the next topic ID
  const nextTopicId = findNextTopic();

  // Set up Intersection Observer to track which subtopic is currently in view
  useEffect(() => {
    // Initialize observer with options
    const options = {
      root: null, // viewport
      rootMargin: "-100px 0px -65% 0px", // top, right, bottom, left
      threshold: [0, 0.1, 0.2, 0.3], // trigger at multiple thresholds for smoother transitions
    };

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver((entries) => {
      // Sort entries by their position in the viewport and intersection ratio
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          // First try to sort by how visible they are (higher intersection ratio first)
          if (Math.abs(a.intersectionRatio - b.intersectionRatio) > 0.1) {
            return b.intersectionRatio - a.intersectionRatio;
          }
          // If visibility is similar, prefer the element closest to the top
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });

      // Get the first (most visible or closest to top) entry
      const topEntry = visibleEntries[0];

      if (topEntry) {
        const subtopicId = topEntry.target.id;
        if (subtopicId) {
          updateViewedSubtopic(subtopicId);
        }
      }
    }, options);

    // Observe all subtopic elements
    Object.values(subtopicRefs.current).forEach((element) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [subtopicsWithExercises, updateViewedSubtopic]);

  // When the active subtopic changes, scroll to that element
  useEffect(() => {
    // We only want this to run on initial page load, not on subsequent subtopic changes
    if (
      initialActiveSubtopicId &&
      subtopicRefs.current[initialActiveSubtopicId] &&
      !sessionStorage.getItem("sidebar_navigation")
    ) {
      requestAnimationFrame(() => {
        const targetElement = subtopicRefs.current[initialActiveSubtopicId];
        if (!targetElement) return;

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    // Clear the flag after initial page load
    return () => {
      sessionStorage.removeItem("sidebar_navigation");
    };
  }, [initialActiveSubtopicId]);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {/* Mobile Topic Menu - Show above topic name on mobile */}
      <div className="block md:hidden mb-4">
        <ExerciseSidebar isMobile={true} />
      </div>

      <ExerciseHeader
        title={currentTopic.name}
        backHref="/dashboard/esercizi"
        showTheoryButton
        theoryHref={`/dashboard/teoria/${currentTopic.id}`}
      >
        {/* Filter dropdown */}
        <DifficultyCompletionFilter
          filters={filterState}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </ExerciseHeader>

      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-3/4 space-y-12 md:border-r md:border-muted md:pr-8">
          {subtopicsWithExercises.length > 0 ? (
            subtopicsWithExercises.map((subtopic, index) => (
              <div
                key={subtopic.id}
                ref={(el) => {
                  if (el) subtopicRefs.current[subtopic.id] = el;
                }}
                id={subtopic.id}
                className="scroll-mt-16"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-semibold mb-6 text-foreground/95 border-b border-muted pb-2">
                    {subtopic.order_index !== null
                      ? `${subtopic.order_index}. `
                      : ""}
                    {subtopic.name}
                  </h2>

                  {/* Exercise Cards Section */}
                  {subtopic.exercise_cards.length > 0 ? (
                    <>
                      {/* Desktop Cards View */}
                      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subtopic.exercise_cards
                          .filter(filterCard)
                          .map((card) => (
                            <ExerciseCard
                              key={card.id}
                              id={card.id}
                              topicName={currentTopic.name}
                              topicOrder={currentTopic.order_index}
                              subtopicName={subtopic.name}
                              subtopicOrder={subtopic.order_index}
                              description={card.description}
                              difficulty={card.difficulty}
                              isCompleted={card.is_completed}
                              totalExercises={card.total_exercises}
                              completedExercises={card.completed_exercises}
                              isFlagged={card.is_flagged}
                            />
                          ))}
                      </div>

                      {/* Mobile Cards View */}
                      <div className="md:hidden">
                        {subtopic.exercise_cards
                          .filter(filterCard)
                          .map((card) => (
                            <div
                              key={card.id}
                              className="border-b border-foreground/10"
                            >
                              <MobileExerciseItem
                                id={card.id}
                                topicName={currentTopic.name}
                                topicOrder={currentTopic.order_index}
                                subtopicName={subtopic.name}
                                subtopicOrder={subtopic.order_index}
                                description={card.description}
                                difficulty={card.difficulty}
                                isCompleted={card.is_completed}
                                totalExercises={card.total_exercises}
                                completedExercises={card.completed_exercises}
                                isFlagged={card.is_flagged}
                              />
                            </div>
                          ))}
                      </div>

                      {/* No results message */}
                      {subtopic.exercise_cards.filter(filterCard).length ===
                        0 && (
                        <div className="text-center p-8 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground">
                            Nessun esercizio corrisponde ai filtri selezionati.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        Non ci sono esercizi disponibili per questo argomento.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                Non ci sono ancora esercizi disponibili per questo tema.
              </p>
            </div>
          )}

          {/* Next Topic Button */}
          {nextTopicId && (
            <div className="flex justify-center pt-8 border-t border-muted">
              <Link href={`/dashboard/esercizi/${nextTopicId}`}>
                <Button
                  className="group px-8 py-6 text-white cursor-pointer"
                  variant="default"
                  size="lg"
                >
                  <span>Vai al prossimo argomento</span>
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="sticky top-8 pt-4">
            <ExerciseSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
