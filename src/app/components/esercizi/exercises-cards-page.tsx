"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopicsSidebar from "@/app/components/shared/navigation/topics-sidebar";
import ExerciseCard from "@/app/components/shared/exercises/ExerciseCard";
import MobileExerciseItem from "@/app/components/shared/exercises/MobileExerciseCard";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseTopicClientProps } from "@/types/exercisesTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExerciseFilters } from "@/hooks/use-exercise-filters";
import DifficultyCompletionFilter from "@/app/components/esercizi/difficulty-completion-filter";
import ExerciseHeader from "@/app/components/esercizi/exercise-header";

export default function TopicExercisesPage({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithExercises,
  activeSubtopicId: initialActiveSubtopicId,
}: ExerciseTopicClientProps) {
  const router = useRouter();
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Handle navigation when clicking on a topic
  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/esercizi/${topicId}`);
  };

  // Handle navigation when clicking on a subtopic
  const handleSubtopicClick = (
    subtopicId: string,
    topicId: string,
    skipUrlUpdate = false
  ) => {
    // If we're already on the correct topic page, just scroll to the subtopic
    if (topicId === currentTopic.id) {
      // Scroll to the subtopic element
      const subtopicElement = subtopicRefs.current[subtopicId];
      if (subtopicElement) {
        subtopicElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Update URL without a full navigation (only if not skipped)
      if (!skipUrlUpdate) {
        const url = new URL(window.location.href);
        url.searchParams.set("subtopic", subtopicId);
        window.history.pushState({}, "", url.toString());
      }
    } else if (!skipUrlUpdate) {
      // Navigate to the appropriate topic page with subtopic in query
      router.push(`/dashboard/esercizi/${topicId}?subtopic=${subtopicId}`);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {/* Mobile Topic Menu - Show above topic name on mobile */}
      <div className="block md:hidden mb-4">
        <TopicsSidebar
          topics={topicsWithSubtopics}
          activeTopicId={currentTopic.id}
          activeSubtopicId={initialActiveSubtopicId}
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
          basePath="/dashboard/esercizi"
        />
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
            <TopicsSidebar
              topics={topicsWithSubtopics}
              activeTopicId={currentTopic.id}
              activeSubtopicId={initialActiveSubtopicId}
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
              basePath="/dashboard/esercizi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
