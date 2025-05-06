"use client";

import { CheckCircle2, Filter } from "lucide-react";
import TopicsSidebar from "@/app/components/dashboard/topics-sidebar";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ExerciseCard from "@/app/components/exercises/ExerciseCard";
import MobileExerciseItem from "@/app/components/exercises/MobileExerciseItem";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define subtopic interface to match TopicsSidebar
interface SubtopicType {
  id: string;
  name: string;
  order_index: number | null;
}

// Define topic interface to match TopicsSidebar
interface TopicType {
  id: string;
  name: string;
  order_index: number | null;
  subtopics: SubtopicType[];
}

interface ExerciseCardType {
  id: string;
  subtopic_id: string | null;
  subtopic_name: string | null;
  topic_name: string | null;
  topic_id: string | null;
  description: string;
  difficulty: number;
  created_at: Date;
  topic_order: number | null;
  subtopic_order: number | null;
  is_completed: boolean;
  total_exercises: number;
  score?: number; // Optional score property
}

interface SubtopicGroup {
  subtopic_name: string;
  subtopic_order: number | null;
  exercise_cards: ExerciseCardType[];
}

interface TopicGroup {
  topic_name: string;
  topic_order: number | null;
  subtopics: Record<string, SubtopicGroup>;
}

interface ClientExercisesPageProps {
  topicsWithSubtopics: TopicType[];
  exerciseCardsByTopic: Record<string, TopicGroup>;
}

export default function ClientExercisesPage({
  topicsWithSubtopics,
  exerciseCardsByTopic,
}: ClientExercisesPageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const activeSubtopicId = searchParams.get("subtopic") || undefined;
  const activeTopicId = searchParams.get("topic") || undefined;

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setMounted(true);

    // Function to check if viewport is mobile sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Set up event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<string | null>(null);

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

  const scrollToSubtopic = (subtopicId: string) => {
    const element = document.getElementById(`subtopic-${subtopicId}`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Filter exercise cards based on current filters
  const filteredExerciseCardsByTopic = Object.entries(
    exerciseCardsByTopic
  ).reduce((acc, [topicId, topic]) => {
    const filteredSubtopics = Object.entries(topic.subtopics).reduce(
      (subAcc, [subtopicId, subtopic]: [string, SubtopicGroup]) => {
        // Filter exercise cards by difficulty
        let filteredCards = subtopic.exercise_cards;

        if (difficultyFilter !== null) {
          filteredCards = filteredCards.filter(
            (card) => card.difficulty === difficultyFilter
          );
        }

        if (completionFilter === "completed") {
          filteredCards = filteredCards.filter((card) => card.is_completed);
        } else if (completionFilter === "not_completed") {
          filteredCards = filteredCards.filter((card) => !card.is_completed);
        }

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

  // Handle scrolling when activeSubtopicId or activeTopicId changes
  // REMOVED automatic scrolling on param changes - only scroll on explicit user action

  // Calculate filter counts for badges
  const activeFilterCount =
    (difficultyFilter !== null ? 1 : 0) + (completionFilter !== null ? 1 : 0);

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
        <h1 className="text-4xl font-bold text-foreground">Esercizi</h1>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtri</span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0.5 h-5 rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtri</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                Difficoltà
              </DropdownMenuLabel>
              {[1, 2, 3].map((level) => (
                <DropdownMenuItem
                  key={`difficulty-${level}`}
                  onClick={() => handleFilterChange("difficulty", level)}
                  className={cn(
                    "flex items-center gap-2",
                    difficultyFilter === level && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(level)].map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          level === 1
                            ? "bg-green-500"
                            : level === 2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    ))}
                    {[...Array(3 - level)].map((_, i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-muted" />
                    ))}
                  </div>
                  <span>
                    {level === 1 ? "Base" : level === 2 ? "Media" : "Avanzata"}
                  </span>
                  {difficultyFilter === level && (
                    <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                Stato
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleFilterChange("completion", "completed")}
                className={cn(completionFilter === "completed" && "bg-muted")}
              >
                Completati
                {completionFilter === "completed" && (
                  <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleFilterChange("completion", "not_completed")
                }
                className={cn(
                  completionFilter === "not_completed" && "bg-muted"
                )}
              >
                Da completare
                {completionFilter === "not_completed" && (
                  <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearFilters}
              >
                Rimuovi filtri
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
                                  id={card.id}
                                  topicName={card.topic_name || ""}
                                  topicOrder={card.topic_order}
                                  subtopicName={card.subtopic_name || ""}
                                  subtopicOrder={card.subtopic_order}
                                  description={card.description}
                                  difficulty={card.difficulty}
                                  isCompleted={card.is_completed}
                                  totalExercises={card.total_exercises}
                                  completedExercises={card.score}
                                />
                              </div>
                            ) : (
                              <ExerciseCard
                                key={card.id}
                                id={card.id}
                                topicName={card.topic_name || ""}
                                topicOrder={card.topic_order}
                                subtopicName={card.subtopic_name || ""}
                                subtopicOrder={card.subtopic_order}
                                description={card.description}
                                difficulty={card.difficulty}
                                isCompleted={card.is_completed}
                                totalExercises={card.total_exercises}
                                completedExercises={card.score}
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
