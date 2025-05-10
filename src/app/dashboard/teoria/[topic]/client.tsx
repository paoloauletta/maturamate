"use client";

import { useEffect, useRef, useState } from "react";
import TopicsSidebar from "@/app/components/dashboard/topics-sidebar";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/app/components/renderer/markdown-renderer";
import Link from "next/link";
import { BookOpen, ChevronRight, Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseCard from "@/app/components/exercises/ExerciseCard";
import { toast } from "sonner";
import { LoadingSpinner } from "@/app/components/loading/loading-spinner";

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

// Add interface for completed topics/subtopics
interface CompletionStatus {
  completedTopicIds: string[];
  completedSubtopicIds: string[];
}

export default function TopicClient({
  currentTopic,
  topicsWithSubtopics,
  subtopicsWithTheory,
  activeSubtopicId: initialActiveSubtopicId,
  userId,
}: TopicClientProps) {
  const router = useRouter();
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Use local state to manage active subtopic ID
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | undefined>(
    initialActiveSubtopicId
  );

  // Add state to track reading progress for each subtopic (0-100%)
  const [readingProgress, setReadingProgress] = useState<
    Record<string, number>
  >({});

  // State to track completion status
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    completedTopicIds: [],
    completedSubtopicIds: [],
  });

  // State to track loading states for buttons
  const [loadingSubtopic, setLoadingSubtopic] = useState<string | null>(null);
  const [loadingTopic, setLoadingTopic] = useState<boolean>(false);

  // Fetch completion status on mount
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        // Only fetch if we don't already have the completion data
        if (
          completionStatus.completedTopicIds.length === 0 &&
          completionStatus.completedSubtopicIds.length === 0
        ) {
          // Call the new API for all topic IDs
          const topicPromises = topicsWithSubtopics.map(async (topic) => {
            const resp = await fetch(
              `/api/user/completion?itemType=topic&itemId=${topic.id}`
            );
            if (resp.ok) {
              const data = await resp.json();
              return { id: topic.id, completed: data.isCompleted };
            }
            return { id: topic.id, completed: false };
          });

          // Call the API for all subtopic IDs
          const subtopicPromises = topicsWithSubtopics.flatMap((topic) =>
            topic.subtopics.map(async (subtopic) => {
              const resp = await fetch(
                `/api/user/completion?itemType=subtopic&itemId=${subtopic.id}`
              );
              if (resp.ok) {
                const data = await resp.json();
                return { id: subtopic.id, completed: data.isCompleted };
              }
              return { id: subtopic.id, completed: false };
            })
          );

          // Wait for all promises to resolve
          const topicResults = await Promise.all(topicPromises);
          const subtopicResults = await Promise.all(subtopicPromises);

          // Update the completion status
          setCompletionStatus({
            completedTopicIds: topicResults
              .filter((result) => result.completed)
              .map((result) => result.id),
            completedSubtopicIds: subtopicResults
              .filter((result) => result.completed)
              .map((result) => result.id),
          });
        }
      } catch (error) {
        console.error("Failed to fetch completion status:", error);
      }
    };

    fetchCompletionStatus();
  }, [
    completionStatus.completedTopicIds.length,
    completionStatus.completedSubtopicIds.length,
    topicsWithSubtopics,
  ]);

  // Add useEffect for scroll tracking
  useEffect(() => {
    // Function to calculate reading progress of an element
    const calculateReadingProgress = (element: HTMLElement): number => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const currentScroll = window.scrollY;

      // If element is not rendered yet or has no height
      if (!element || rect.height === 0) return 0;

      // Element hasn't entered viewport yet
      if (rect.top > viewportHeight) return 0;

      // Element has been completely scrolled past
      if (rect.bottom < 0) return 100;

      // Element is partially visible - calculate progress based on how much has been scrolled through
      const elementTop = rect.top + currentScroll - 100; // Adding some offset to start progress earlier
      const elementBottom = elementTop + rect.height;

      // How far through the element we've scrolled
      const scrollProgress = (currentScroll - elementTop) / rect.height;

      // Ensure the value is between 0-100
      return Math.min(100, Math.max(0, scrollProgress * 100));
    };

    // Function to handle scroll events with debounce
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Update reading progress for all subtopics
        const newProgress: Record<string, number> = { ...readingProgress };

        Object.entries(subtopicRefs.current).forEach(
          ([subtopicId, element]) => {
            if (element) {
              const progress = calculateReadingProgress(element);

              // Only update if:
              // 1. Progress is higher than before (user reads forward), or
              // 2. Progress dropped significantly (user jumped to different section)
              if (
                progress > (newProgress[subtopicId] || 0) ||
                (newProgress[subtopicId] || 0) - progress > 20
              ) {
                newProgress[subtopicId] = progress;
              }
            }
          }
        );

        setReadingProgress(newProgress);
      }, 100); // Debounce for 100ms to avoid excessive updates
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Calculate initial state
    handleScroll();

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [subtopicsWithTheory, readingProgress]);

  // Function to mark a subtopic as completed
  const markSubtopicAsCompleted = async (subtopicId: string) => {
    setLoadingSubtopic(subtopicId);
    try {
      const response = await fetch("/api/subtopics/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subtopic_id: subtopicId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state - don't add if already present
        setCompletionStatus((prev) => ({
          ...prev,
          completedSubtopicIds: prev.completedSubtopicIds.includes(subtopicId)
            ? prev.completedSubtopicIds
            : [...prev.completedSubtopicIds, subtopicId],
        }));
        toast.success("Sottotopico completato con successo!");
      } else {
        console.error("Error response:", data);
        toast.error(
          data.error || "Errore nel salvare il completamento del sottotopico"
        );
      }
    } catch (error) {
      console.error("Error marking subtopic as completed:", error);
      toast.error("Errore nel salvare il completamento del sottotopico");
    } finally {
      setLoadingSubtopic(null);
    }
  };

  // Function to mark a topic as completed
  const markTopicAsCompleted = async (topicId: string) => {
    setLoadingTopic(true);
    try {
      const response = await fetch("/api/topics/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic_id: topicId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Get all subtopics for the current topic from the API response or fetch from props
        const topicSubtopicIds =
          data.completedSubtopicIds ||
          topicsWithSubtopics
            .find((t) => t.id === topicId)
            ?.subtopics.map((s) => s.id) ||
          [];

        // Update local state for both topic and all its subtopics
        setCompletionStatus((prev) => {
          // Don't add the topic if it's already in the array
          const updatedTopicIds = prev.completedTopicIds.includes(topicId)
            ? prev.completedTopicIds
            : [...prev.completedTopicIds, topicId];

          // Get unique list of completed subtopic IDs (existing + new ones)
          const updatedSubtopicIds = Array.from(
            new Set([...prev.completedSubtopicIds, ...topicSubtopicIds])
          );

          return {
            completedTopicIds: updatedTopicIds,
            completedSubtopicIds: updatedSubtopicIds,
          };
        });

        toast.success("Argomento completato con successo!");
      } else {
        console.error("Error response:", data);
        toast.error(
          data.error || "Errore nel salvare il completamento dell'argomento"
        );
      }
    } catch (error) {
      console.error("Error marking topic as completed:", error);
      toast.error("Errore nel salvare il completamento dell'argomento");
    } finally {
      setLoadingTopic(false);
    }
  };

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
    router.push(`/dashboard/teoria/${topicId}`);
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

      // Update URL without a full navigation
      if (!skipUrlUpdate) {
        const url = new URL(window.location.href);
        url.searchParams.set("subtopic", subtopicId);
        window.history.pushState({}, "", url.toString());
      }
    } else if (!skipUrlUpdate) {
      // Navigate to the appropriate topic page with subtopic in query
      router.push(`/dashboard/teoria/${topicId}?subtopic=${subtopicId}`);
    }
  };

  // Handle click on "Vai al prossimo argomento" button
  const handleNextTopicClick = async () => {
    if (nextTopicId) {
      try {
        // Mark the current topic as completed
        await markTopicAsCompleted(currentTopic.id);

        // Only navigate if we're not in loading state (indicating success)
        if (!loadingTopic) {
          // Navigate to the next topic
          router.push(`/dashboard/teoria/${nextTopicId}`);
        }
      } catch (error) {
        console.error("Error navigating to next topic:", error);
        toast.error("Errore nel passare all'argomento successivo");
      }
    }
  };

  if (loadingTopic) {
    return <LoadingSpinner text="Caricamento teoria..." />;
  }

  if (loadingSubtopic) {
    return <LoadingSpinner text="Caricamento teoria..." />;
  }

  return (
    <div className="">
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
          completedTopicIds={completionStatus.completedTopicIds}
          completedSubtopicIds={completionStatus.completedSubtopicIds}
          readingProgress={readingProgress}
        />
      </div>

      <div className="flex justify-between items-center lg:mt-0 lg:mb-8 lg:pb-4 border-b border-border mt-12 mb-6 pb-2">
        <h1 className="md:text-4xl text-3xl font-bold text-left">
          {currentTopic.name}
          {completionStatus.completedTopicIds.includes(currentTopic.id) && (
            <CheckCircle className="inline-block ml-2 h-6 w-6 text-green-500" />
          )}
        </h1>
        <Link
          href={`/dashboard/esercizi/${currentTopic.id}`}
          className="hidden md:block"
        >
          <Button
            className="flex items-center gap-2 cursor-pointer"
            variant="outline"
          >
            <BookOpen className="h-4 w-4" />
            Esercitati su questo argomento
          </Button>
        </Link>
      </div>

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

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="md:text-3xl text-2xl font-semibold text-foreground/95">
                      <span className="text-primary">
                        {subtopic.order_index !== null
                          ? `${subtopic.order_index}. `
                          : ""}
                      </span>
                      <span>{subtopic.name}</span>
                      {completionStatus.completedSubtopicIds.includes(
                        subtopic.id
                      ) && (
                        <CheckCircle className="inline-block ml-2 h-5 w-5 text-green-500" />
                      )}
                    </h2>
                  </div>

                  {subtopic.theory.length > 0 ? (
                    <div className="mt-6">
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

                      {/* Mark Subtopic as Completed Button */}
                      <div className="flex lg:justify-end my-8 justify-center">
                        <Button
                          variant={
                            completionStatus.completedSubtopicIds.includes(
                              subtopic.id
                            )
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          onClick={() => markSubtopicAsCompleted(subtopic.id)}
                          disabled={
                            loadingSubtopic === subtopic.id ||
                            completionStatus.completedSubtopicIds.includes(
                              subtopic.id
                            )
                          }
                          className={
                            completionStatus.completedSubtopicIds.includes(
                              subtopic.id
                            )
                              ? "text-green-500 border-green-500"
                              : ""
                          }
                        >
                          {loadingSubtopic === subtopic.id ? (
                            <>Caricamento...</>
                          ) : completionStatus.completedSubtopicIds.includes(
                              subtopic.id
                            ) ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Completato
                            </>
                          ) : (
                            <div className="flex gap-1 items-center cursor-pointer text-white">
                              <Check className="h-4 w-4 mr-1" />
                              Segna come completato
                            </div>
                          )}
                        </Button>
                      </div>

                      {/* Exercise Preview Section */}
                      {subtopic.exercise_cards.length > 0 && (
                        <div className="border-t pt-8">
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
                            <div className="flex justify-start mt-4 lg:mt-8 p-1">
                              <Link
                                href={`/dashboard/esercizi?subtopic=${subtopic.id}`}
                              >
                                <Button
                                  className="group px-8  text-white cursor-pointer"
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

          {/* Next Topic Button */}
          {nextTopicId && (
            <div className="flex justify-center pt-8 border-t border-muted mt-12">
              <Button
                className="group px-8 py-6 text-white cursor-pointer"
                variant="default"
                size="lg"
                onClick={handleNextTopicClick}
                disabled={loadingTopic}
              >
                {loadingTopic ? (
                  <span>Caricamento...</span>
                ) : (
                  <>
                    <span>Vai al prossimo argomento</span>
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
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
              completedTopicIds={completionStatus.completedTopicIds}
              completedSubtopicIds={completionStatus.completedSubtopicIds}
              readingProgress={readingProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
