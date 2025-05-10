"use client";

import { useEffect, useRef, useState } from "react";
import TopicsSidebar from "@/app/components/dashboard/topics-sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExerciseCard from "@/app/components/exercises/ExerciseCard";
import MobileExerciseItem from "@/app/components/exercises/MobileExerciseItem";
import { Filter, ChevronRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface SubtopicWithExercisesType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
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

interface ExerciseTopicClientProps {
  currentTopic: TopicType;
  topicsWithSubtopics: SidebarTopicType[];
  subtopicsWithExercises: SubtopicWithExercisesType[];
  activeSubtopicId?: string;
  userId: string;
}

// Add isMobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export default function ExercisesTopicClient({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithExercises,
  activeSubtopicId: initialActiveSubtopicId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
}: ExerciseTopicClientProps) {
  const router = useRouter();
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Use local state to manage active subtopic ID
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | undefined>(
    initialActiveSubtopicId
  );

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<string | null>(null);

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
      // Update local state to trigger UI updates in this component and sidebar
      setActiveSubtopicId(subtopicId);

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

  // Filter handlers
  const handleFilterChange = (type: string, value: number | string) => {
    if (type === "difficulty") {
      setDifficultyFilter(
        value === difficultyFilter ? null : (value as number)
      );
    } else if (type === "completion") {
      setCompletionFilter(
        value === completionFilter ? null : (value as string)
      );
    }
  };

  const clearFilters = () => {
    setDifficultyFilter(null);
    setCompletionFilter(null);
  };

  // Calculate filter counts for badges
  const activeFilterCount =
    (difficultyFilter !== null ? 1 : 0) + (completionFilter !== null ? 1 : 0);

  // Filter function for exercise cards
  const filterCards = (card: ExerciseCardType) => {
    // Apply difficulty filter
    if (difficultyFilter !== null && card.difficulty !== difficultyFilter) {
      return false;
    }

    // Apply completion filter
    if (completionFilter === "completed" && !card.is_completed) {
      return false;
    }
    if (completionFilter === "not_completed" && card.is_completed) {
      return false;
    }

    return true;
  };

  return (
    <div>
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
          basePath="/dashboard/esercizi"
        />
      </div>

      <div className="flex justify-between items-center lg:mt-0 lg:mb-8 lg:pb-4 border-b border-border mt-12 mb-6 pb-2">
        <div className="flex flex-row gap-2">
          <h1 className="text-4xl font-bold text-left md:block hidden">
            Esercizi:{" "}
          </h1>
          <h1 className="text-4xl font-bold text-left">{currentTopic.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                <Filter className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Filtri</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center rounded-full"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtri</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Difficoltà
                </DropdownMenuLabel>

                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    difficultyFilter === 1 ? "bg-accent" : ""
                  }`}
                  onClick={() => handleFilterChange("difficulty", 1)}
                >
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="h-2 w-2 rounded-full bg-muted" />
                    <span className="h-2 w-2 rounded-full bg-muted" />
                  </div>
                  <span>Facile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    difficultyFilter === 2 ? "bg-accent" : ""
                  }`}
                  onClick={() => handleFilterChange("difficulty", 2)}
                >
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-muted" />
                  </div>
                  <span>Media</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    difficultyFilter === 3 ? "bg-accent" : ""
                  }`}
                  onClick={() => handleFilterChange("difficulty", 3)}
                >
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                  </div>
                  <span>Difficile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Stato Completamento
                </DropdownMenuLabel>

                <DropdownMenuItem
                  className={`${
                    completionFilter === "completed" ? "bg-accent" : ""
                  }`}
                  onClick={() => handleFilterChange("completion", "completed")}
                >
                  Completati
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={`${
                    completionFilter === "not_completed" ? "bg-accent" : ""
                  }`}
                  onClick={() =>
                    handleFilterChange("completion", "not_completed")
                  }
                >
                  Non Completati
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={activeFilterCount === 0}
                onClick={clearFilters}
                className="text-center justify-center font-medium"
              >
                Cancella Filtri
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theory button - hidden on mobile */}
          <Link
            href={`/dashboard/teoria/${currentTopic.id}`}
            className="hidden md:block"
          >
            <Button
              className="flex items-center gap-2 cursor-pointer"
              variant="outline"
            >
              <Book className="h-4 w-4" />
              Studia la Teoria
            </Button>
          </Link>
        </div>
      </div>

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
                    <span className="text-primary">
                      {subtopic.order_index !== null
                        ? `${subtopic.order_index}. `
                        : ""}
                    </span>
                    {subtopic.name}
                  </h2>

                  {/* Exercise Cards Section */}
                  {subtopic.exercise_cards.length > 0 ? (
                    <>
                      {/* Desktop Cards View */}
                      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subtopic.exercise_cards
                          .filter(filterCards)
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
                            />
                          ))}
                      </div>

                      {/* Mobile Cards View */}
                      <div className="md:hidden">
                        {subtopic.exercise_cards
                          .filter(filterCards)
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
                              />
                            </div>
                          ))}
                      </div>

                      {/* No results message */}
                      {subtopic.exercise_cards.filter(filterCards).length ===
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
              basePath="/dashboard/esercizi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
