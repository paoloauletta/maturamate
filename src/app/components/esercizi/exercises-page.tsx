"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TopicsSidebar from "@/app/components/shared/navigation/topics-sidebar";
import ExerciseCard from "@/app/components/shared/exercises/ExerciseCard";
import MobileExerciseItem from "@/app/components/shared/exercises/MobileExerciseCard";
import { cn } from "@/lib/utils";
import { SubtopicGroup, TopicGroup } from "@/types/exercisesTypes";
import { TopicWithSubtopicsType } from "@/types/topicsTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExerciseFilters } from "@/hooks/use-exercise-filters";
import DifficultyCompletionFilter from "@/app/components/esercizi/difficulty-completion-filter";

interface ExercisesPageProps {
  topicsWithSubtopics: TopicWithSubtopicsType[];
  exerciseCardsByTopic: Record<string, TopicGroup>;
}

export default function ExercisesPage({
  topicsWithSubtopics,
  exerciseCardsByTopic,
}: ExercisesPageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const activeSubtopicId = searchParams.get("subtopic") || undefined;
  const activeTopicId = searchParams.get("topic") || undefined;

  const { isMobile, mounted } = useIsMobile();
  const { filterState, handleFilterChange, clearFilters, filterCard } =
    useExerciseFilters();

  // Filter exercise cards based on current filters
  const filteredExerciseCardsByTopic = Object.entries(
    exerciseCardsByTopic
  ).reduce((acc, [topicId, topic]) => {
    const filteredSubtopics = Object.entries(topic.subtopics).reduce(
      (subAcc, [subtopicId, subtopic]: [string, SubtopicGroup]) => {
        // Filter exercise cards by difficulty and completion
        const filteredCards = subtopic.exercise_cards.filter(filterCard);

        if (filteredCards.length > 0) {
          subAcc[subtopicId] = {
            ...subtopic,
            exercise_cards: filteredCards,
          };
        }

        return subAcc;
      },
      {} as Record<string, SubtopicGroup>
    );

    if (Object.keys(filteredSubtopics).length > 0) {
      acc[topicId] = {
        ...topic,
        subtopics: filteredSubtopics,
      };
    }

    return acc;
  }, {} as Record<string, TopicGroup>);

  const scrollToTopic = (topicId: string, skipUrlUpdate = false) => {
    const element = document.getElementById(`topic-${topicId}`);
    if (element) {
      const headerOffset = 100; // Add offset from the top
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    // Update URL params only if not skipped
    if (!skipUrlUpdate) {
      updateTopicParam(topicId);
    }
  };

  const updateSubtopicParam = (subtopicId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("subtopic", subtopicId);
    // Clear topic param when a subtopic is selected
    params.delete("topic");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateTopicParam = (topicId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("topic", topicId);
    // Clear subtopic param when a topic is selected
    params.delete("subtopic");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
          activeTopicId={activeTopicId}
          activeSubtopicId={activeSubtopicId}
          onTopicClick={scrollToTopic}
          onSubtopicClick={updateSubtopicParam}
        />
      </div>
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <h1 className="text-4xl font-bold text-primary">Esercizi</h1>

        {/* Filter dropdown */}
        <DifficultyCompletionFilter
          filters={filterState}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-3/4 lg:border-r lg:border-muted lg:pr-8">
          {Object.entries(filteredExerciseCardsByTopic).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nessun esercizio trovato con i filtri selezionati.
            </div>
          ) : (
            Object.entries(filteredExerciseCardsByTopic).map(
              ([topicId, topic]) => (
                <div
                  key={topicId}
                  id={`topic-${topicId}`}
                  className="mb-10 scroll-mt-24"
                >
                  <h2 className="text-3xl text-foreground/95 font-semibold mb-4 border-b border-muted pb-2">
                    {topic.topic_order !== null
                      ? `${topic.topic_order}. ${topic.topic_name}`
                      : topic.topic_name}
                  </h2>

                  {Object.entries(topic.subtopics).map(
                    ([subtopicId, subtopic], subtopicIndex) => (
                      <div
                        key={subtopicId}
                        id={`subtopic-${subtopicId}`}
                        className="mb-8 scroll-mt-24"
                      >
                        <div
                          className={`text-2xl text-foreground/80 lg:rounded-sm font-medium mb-2 lg:mb-5 flex flex-row gap-2 ${
                            subtopicId === activeSubtopicId
                              ? "lg:border-l-4 lg:border-primary"
                              : "lg:border-l-4 lg:border-border"
                          } lg:pl-2`}
                        >
                          <h3
                            className={`${
                              subtopicId === activeSubtopicId
                                ? "text-primary"
                                : "text-foreground/80"
                            }`}
                          >
                            {topic.topic_order !== null &&
                            subtopic.subtopic_order !== null
                              ? `${topic.topic_order}.${subtopic.subtopic_order} `
                              : ""}
                          </h3>
                          <h3>{subtopic.subtopic_name}</h3>
                        </div>

                        <div
                          className={
                            isMobile
                              ? "space-y-0 rounded-md overflow-hidden"
                              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          }
                        >
                          {subtopic.exercise_cards.map((card, index) =>
                            isMobile ? (
                              <div
                                key={card.id}
                                className={cn(
                                  "",
                                  index === 0
                                    ? "border-b border-foreground/10"
                                    : "border-b border-foreground/10",
                                  index === subtopic.exercise_cards.length - 1
                                    ? ""
                                    : ""
                                )}
                              >
                                <MobileExerciseItem
                                  key={card.id}
                                  id={card.id}
                                  topicName={card.topic_name || ""}
                                  topicOrder={card.topic_order ?? null}
                                  subtopicName={card.subtopic_name || ""}
                                  subtopicOrder={card.subtopic_order ?? null}
                                  description={card.description}
                                  difficulty={card.difficulty}
                                  isCompleted={card.is_completed}
                                  totalExercises={card.total_exercises}
                                  completedExercises={card.score ?? undefined}
                                />
                              </div>
                            ) : (
                              <ExerciseCard
                                key={card.id}
                                id={card.id}
                                topicName={card.topic_name || ""}
                                topicOrder={card.topic_order ?? null}
                                subtopicName={card.subtopic_name || ""}
                                subtopicOrder={card.subtopic_order ?? null}
                                description={card.description}
                                difficulty={card.difficulty}
                                isCompleted={card.is_completed}
                                totalExercises={card.total_exercises}
                                completedExercises={card.score ?? undefined}
                                disableHeader={true}
                              />
                            )
                          )}
                        </div>

                        {/* Add divider between subtopics except for the last one */}
                        {subtopicIndex <
                          Object.entries(topic.subtopics).length - 1 && (
                          <div className="lg:my-8 lg:border-b lg:border-muted"></div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )
            )
          )}
        </div>
        {/* Sidebar (only shown on desktop) */}
        <div className="hidden md:block md:w-1/4 relative">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto lg:pb-10 pb-0">
            <TopicsSidebar
              topics={topicsWithSubtopics}
              activeTopicId={activeTopicId}
              activeSubtopicId={activeSubtopicId}
              onTopicClick={scrollToTopic}
              onSubtopicClick={updateSubtopicParam}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
