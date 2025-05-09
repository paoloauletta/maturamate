"use client";

import { Exercise } from "@/app/components/exercises/Exercise";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MobileExerciseView = dynamic<MobileExerciseViewProps>(
  () =>
    import("@/app/components/exercises/MobileExerciseView").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

interface MobileExerciseViewProps {
  id: string;
  number: number;
  question: string;
  solution: string;
  onMarkCorrect: (
    exerciseId: string,
    isCorrect: boolean,
    attempt: number
  ) => Promise<void>;
  isCompleted: boolean;
  wasCorrect: boolean;
  tutorState: "none" | "showOptions" | "showTutor";
  autoExpand: boolean;
  onExerciseComplete: (exerciseId: string, isCorrect: boolean) => void;
}

// Define types for question and solution data
interface QuestionData {
  text?: string;
  html?: string;
  [key: string]: unknown;
}

// Allow for array of strings as well in question_data
type QuestionDataType = string | string[] | QuestionData;

interface SolutionData {
  html?: string;
  question?: string;
  [key: string]: unknown;
}

// Allow for array of strings in solution_data as well
type SolutionDataType = string | string[] | SolutionData;

interface Exercise {
  id: string;
  question_data: QuestionDataType;
  solution_data: SolutionDataType;
  order_index: number | null;
}

interface ExerciseCardClientProps {
  id: string;
  description: string;
  difficulty: number;
  topicId: string;
  topicName: string;
  subtopicId: string;
  subtopicName: string;
  exercises: Exercise[];
  completedExercises: Record<string, { isCorrect: boolean; attempts: number }>;
}

// Difficulty labels
const difficultyLabels = ["Base", "Media", "Avanzata"];

// Helper function to render question data in appropriate format
const renderQuestionData = (data: QuestionDataType): string => {
  if (typeof data === "string") {
    return data;
  }

  // Handle array of strings - join them with line breaks
  if (Array.isArray(data)) {
    return data.join("\n");
  }

  // Handle object with text property
  if (data?.text) {
    return data.text;
  }

  // Handle object with html property - extract text content
  if (data?.html) {
    return data.html;
  }

  // Fallback to JSON representation
  return JSON.stringify(data);
};

// Helper function to render solution data in appropriate format
const renderSolutionData = (data: SolutionDataType): string => {
  if (typeof data === "string") {
    return data;
  }

  // Handle array of strings - join them with line breaks
  if (Array.isArray(data)) {
    return data.join("\n");
  }

  // Handle object with html property
  if (data && typeof data === "object" && "html" in data) {
    return data.html as string;
  }

  // Fallback to JSON representation
  return JSON.stringify(data);
};

export default function ExerciseCardClient({
  id,
  description,
  difficulty,
  topicName,
  subtopicName,
  exercises,
  completedExercises,
}: ExerciseCardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromFavorites = searchParams.get("from") === "preferiti";

  // Create a simplified map of just exercise ID to correctness for easier state tracking
  const initialCompletionState = Object.entries(completedExercises).reduce(
    (acc, [exerciseId, data]) => {
      acc[exerciseId] = data.isCorrect;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const [localCompletedExercises, setLocalCompletedExercises] = useState<
    Record<string, boolean>
  >(initialCompletionState);

  // Track tutor interaction state for each exercise
  const [exerciseTutorState, setExerciseTutorState] = useState<
    Record<string, "none" | "showOptions" | "showTutor">
  >(
    Object.entries(completedExercises).reduce((acc, [exerciseId, data]) => {
      // If the exercise was completed but incorrect, assume it's in 'showOptions' state
      acc[exerciseId] = !data.isCorrect ? "showOptions" : "none";
      return acc;
    }, {} as Record<string, "none" | "showOptions" | "showTutor">)
  );

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isCardFlagged, setIsCardFlagged] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // NEW: Track which exercise IDs should be expanded in mobile view
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
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

  // Update the current exercise index when a card is clicked
  const handleExerciseClick = (index: number) => {
    setCurrentExerciseIndex(index);
  };

  // Calculate progress - only count CORRECTLY completed exercises
  const totalExercises = exercises.length;
  const correctCount = Object.values(localCompletedExercises).filter(
    Boolean
  ).length;
  // Progress percentage based only on CORRECT exercises
  const progressPercentage =
    totalExercises > 0 ? (correctCount / totalExercises) * 100 : 0;

  const allCorrect = useMemo(() => {
    return (
      Object.keys(localCompletedExercises).length === exercises.length &&
      Object.values(localCompletedExercises).every((value) => value === true)
    );
  }, [localCompletedExercises, exercises.length]);

  // Sort exercises by order_index if available
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.order_index === null) return 1;
    if (b.order_index === null) return -1;
    return a.order_index - b.order_index;
  });

  // Find the first incomplete exercise
  const findFirstIncompleteExerciseIndex = () => {
    // Find the first exercise that's not completed correctly
    for (let i = 0; i < sortedExercises.length; i++) {
      const exerciseId = sortedExercises[i].id;
      // Not in the completedExercises map or not correct
      if (
        !(exerciseId in localCompletedExercises) ||
        localCompletedExercises[exerciseId] === false
      ) {
        return i;
      }
    }

    // If all exercises are completed correctly, return the first one
    return 0;
  };

  // Get the index of the first incomplete exercise
  const firstIncompleteIndex = findFirstIncompleteExerciseIndex();

  // Set up initial expanded exercise when component mounts
  useEffect(() => {
    if (isMobile && sortedExercises.length > 0) {
      // If all exercises are already correctly completed, don't auto-expand any
      if (allCorrect) {
        setExpandedExerciseIds([]);
      }
      // Otherwise set the first incomplete exercise as expanded
      else if (
        firstIncompleteIndex >= 0 &&
        firstIncompleteIndex < sortedExercises.length
      ) {
        setExpandedExerciseIds([sortedExercises[firstIncompleteIndex].id]);
      }
    }
    // This effect should only run once when component mounts or when major props change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, sortedExercises.length, allCorrect]);

  // Handle exercise completion and expand next incomplete exercise
  const handleExerciseComplete = (exerciseId: string, isCorrect: boolean) => {
    if (isCorrect && isMobile) {
      // Create a local updated completed exercises map to check if all exercises are now complete
      const updatedCompletedExercises = {
        ...localCompletedExercises,
        [exerciseId]: isCorrect,
      };

      // Check if all exercises are now correctly completed
      const allExercisesCorrect = sortedExercises.every(
        (ex) =>
          ex.id in updatedCompletedExercises && updatedCompletedExercises[ex.id]
      );

      // If all exercises are now complete, don't expand any
      if (allExercisesCorrect) {
        setTimeout(() => {
          setExpandedExerciseIds([]);
        }, 400);
        return;
      }

      // Find current exercise index
      const currentIndex = sortedExercises.findIndex(
        (ex) => ex.id === exerciseId
      );

      // Find the next incomplete exercise to auto-expand
      let nextIncompleteIndex = -1;
      for (let i = currentIndex + 1; i < sortedExercises.length; i++) {
        const nextExId = sortedExercises[i].id;
        if (
          !(nextExId in updatedCompletedExercises) ||
          !updatedCompletedExercises[nextExId]
        ) {
          nextIncompleteIndex = i;
          break;
        }
      }

      // Expand next incomplete exercise (with a delay) if found
      if (nextIncompleteIndex !== -1) {
        setTimeout(() => {
          setExpandedExerciseIds([sortedExercises[nextIncompleteIndex].id]);
        }, 400);
      } else if (currentIndex === sortedExercises.length - 1) {
        // This was the last exercise, keep it expanded for a moment then collapse
        setTimeout(() => {
          setExpandedExerciseIds([]);
        }, 400);
      } else {
        // If no next incomplete exercise, collapse all after delay
        setTimeout(() => {
          setExpandedExerciseIds([]);
        }, 400);
      }
    }
  };

  // Function to mark an exercise as complete (correct or incorrect)
  const handleCompleteExercise = async (
    exerciseId: string,
    isCorrect: boolean,
    attempt: number
  ) => {
    try {
      console.log(
        `Recording exercise ${exerciseId} as ${
          isCorrect ? "correct" : "incorrect"
        }, attempt: ${attempt}`
      );

      // Create a new updated state to check if all exercises are now completed correctly
      const updatedCompletedExercises = {
        ...localCompletedExercises,
        [exerciseId]: isCorrect,
      };

      // Update local state first to avoid UI lag
      setLocalCompletedExercises(updatedCompletedExercises);

      // Update tutor state if needed
      if (!isCorrect) {
        setExerciseTutorState(
          (prev: Record<string, "none" | "showOptions" | "showTutor">) => ({
            ...prev,
            [exerciseId]: "showOptions",
          })
        );
      }

      // Make API call to update the exercise completion status
      const response = await fetch("/api/exercises/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId,
          isCorrect,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API response error:", errorData);
      }

      // Check if this was the last exercise needed to complete the card
      // We need all exercises to be in the state AND all to be correct
      const allExercisesInState = exercises.every(
        (ex) => ex.id === exerciseId || ex.id in updatedCompletedExercises
      );
      const allExercisesCorrect = exercises.every(
        (ex) =>
          (ex.id === exerciseId && isCorrect) ||
          (ex.id in updatedCompletedExercises &&
            updatedCompletedExercises[ex.id] === true)
      );

      // If this completes the card and all are correct, automatically mark the card as complete
      if (isCorrect && allExercisesInState && allExercisesCorrect) {
        console.log("Automatically marking card as complete");
        try {
          const cardResponse = await fetch("/api/exercises/complete-card", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardId: id,
            }),
          });

          if (!cardResponse.ok) {
            console.error("Failed to complete card", await cardResponse.json());
          }
        } catch (cardError) {
          console.error("Error completing card:", cardError);
        }
      }

      // If this was marked correct and not the last exercise, move to next
      if (isCorrect && currentExerciseIndex < sortedExercises.length - 1) {
        setTimeout(() => {
          setCurrentExerciseIndex((prev) => prev + 1);
        }, 400);
      }

      // Refresh the UI if all exercises are completed
      if (Object.keys(updatedCompletedExercises).length >= exercises.length) {
        router.refresh();
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Error completing exercise:", error);
      return Promise.reject(error);
    }
  };

  // Note: Card completion is now handled automatically in handleCompleteExercise
  // when the last exercise is marked as correct

  // Scroll to current exercise when it changes
  useEffect(() => {
    const currentRef = exerciseRefs.current[currentExerciseIndex];
    if (currentRef) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        // Get the element's position relative to the viewport
        const rect = currentRef.getBoundingClientRect();

        // Calculate the position to scroll to (element's top position relative to the document)
        // minus 150px to create margin at the top
        const scrollToY = window.scrollY + rect.top - 150;

        // Perform the scroll
        window.scrollTo({
          top: scrollToY,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [currentExerciseIndex]);

  // Check if this card is flagged when component mounts
  useEffect(() => {
    const checkIfCardFlagged = async () => {
      try {
        const response = await fetch(`/api/exercises/flag-card?cardId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsCardFlagged(data.flagged);
        }
      } catch (error) {
        console.error("Error checking if card is flagged:", error);
      }
    };

    checkIfCardFlagged();
  }, [id]);

  // Toggle flag status for the entire card
  const handleToggleCardFlag = async () => {
    setIsFlagging(true);

    try {
      const response = await fetch("/api/exercises/flag-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsCardFlagged(data.flagged);
      }
    } catch (error) {
      console.error("Error toggling card flag:", error);
    } finally {
      setIsFlagging(false);
    }
  };

  return (
    <div className="lg:w-[67%] md:mx-auto">
      {/* Back button and header */}
      <div className="mb-6 flex flex-col lg:gap-2 gap-1">
        <Link
          href={fromFavorites ? "/dashboard/preferiti" : "/dashboard/esercizi"}
        >
          <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
            <ArrowLeft className="h-4 w-4" />
            <span>
              {fromFavorites ? "Torna ai preferiti" : "Torna agli esercizi"}
            </span>
          </div>
        </Link>

        <div className="flex items-center justify-between mb-1">
          <h1 className="lg:text-4xl text-2xl font-bold">{description}</h1>
          <button
            onClick={handleToggleCardFlag}
            className={cn(
              "p-2 hover:text-yellow-500 cursor-pointer hover:scale-105 transition-colors",
              isCardFlagged ? "text-yellow-500" : "text-muted-foreground"
            )}
            disabled={isFlagging}
          >
            <Star
              className="h-5 w-5"
              fill={isCardFlagged ? "currentColor" : "none"}
            />
          </button>
        </div>

        <div className="text-sm text-muted-foreground">
          {topicName} &gt; {subtopicName}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {/* Difficulty indicator */}
          <div className="flex items-center gap-1">
            {[...Array(difficulty)].map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  difficulty === 1
                    ? "bg-green-500 dark:bg-green-400"
                    : difficulty === 2
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-red-500 dark:bg-red-400"
                }`}
              />
            ))}
            {[...Array(3 - difficulty)].map((_, i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="font-medium">Progresso</span>
          <span className="text-muted-foreground">
            {correctCount}/{totalExercises} corretti
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main content - exercises */}
      <div className="mt-8">
        {isMobile ? (
          // Mobile view with collapsible accordion-style exercises
          <div className="space-y-0 divide-y divide-border overflow-hidden">
            {sortedExercises.map((exercise, index) => {
              // Helper functions for exercise state
              const isExerciseCompleted = (exerciseId: string): boolean =>
                exerciseId in localCompletedExercises;

              const wasExerciseCorrect = (exerciseId: string): boolean =>
                localCompletedExercises[exerciseId] === true;

              const currentTutorState = (
                exerciseId: string
              ): "none" | "showOptions" | "showTutor" =>
                exerciseTutorState[exerciseId] || "none";

              // Check if this exercise should be expanded
              const shouldAutoExpand = expandedExerciseIds.includes(
                exercise.id
              );

              return (
                <MobileExerciseView
                  key={exercise.id}
                  id={exercise.id}
                  number={index + 1}
                  question={renderQuestionData(exercise.question_data)}
                  solution={renderSolutionData(exercise.solution_data)}
                  onMarkCorrect={handleCompleteExercise}
                  isCompleted={isExerciseCompleted(exercise.id)}
                  wasCorrect={wasExerciseCorrect(exercise.id)}
                  tutorState={currentTutorState(exercise.id)}
                  autoExpand={shouldAutoExpand}
                  onExerciseComplete={handleExerciseComplete}
                />
              );
            })}
          </div>
        ) : (
          // Desktop view with larger cards
          <div>
            {sortedExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                ref={(el) => {
                  exerciseRefs.current[index] = el;
                }}
                id={`exercise-${index}`}
              >
                <Exercise
                  id={exercise.id}
                  number={index + 1}
                  question={renderQuestionData(exercise.question_data)}
                  solution={renderSolutionData(exercise.solution_data)}
                  onMarkCorrect={handleCompleteExercise}
                  isCurrent={index === currentExerciseIndex}
                  isCompleted={exercise.id in localCompletedExercises}
                  wasCorrect={
                    exercise.id in localCompletedExercises
                      ? localCompletedExercises[exercise.id]
                      : false
                  }
                  tutorState={
                    exercise.id in exerciseTutorState
                      ? exerciseTutorState[exercise.id]
                      : "none"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion feedback when all exercises are done */}
      {allCorrect && (
        <Card className="mt-10 bg-green-500/5 border-green-500/20">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Ottimo lavoro!</h3>
            <p className="text-muted-foreground mb-6">
              Hai completato correttamente tutti gli esercizi in questa scheda.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/esercizi">Torna agli esercizi</Link>
              </Button>
              {/* Add a "next card" button if available */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
