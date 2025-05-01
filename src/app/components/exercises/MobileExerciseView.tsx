"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  MessageSquareText,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MathRenderer from "@/app/components/mathRenderer";
import { motion, AnimatePresence } from "framer-motion";

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
  isCompleted?: boolean;
  wasCorrect?: boolean;
  tutorState?: "none" | "showOptions" | "showTutor";
  autoExpand?: boolean;
  onExerciseComplete?: (id: string, isCorrect: boolean) => void;
}

export default function MobileExerciseView({
  id,
  number,
  question,
  solution,
  onMarkCorrect,
  isCompleted = false,
  wasCorrect = false,
  tutorState = "none",
  autoExpand = false,
  onExerciseComplete,
}: MobileExerciseViewProps) {
  // Add a ref for the component
  const exerciseRef = useRef<HTMLDivElement>(null);

  // Main state management
  const [isRevealed, setIsRevealed] = useState(isCompleted);
  const [isIncorrect, setIsIncorrect] = useState(isCompleted && !wasCorrect);
  const [showTutor, setShowTutor] = useState(tutorState === "showTutor");
  const [attemptCount, setAttemptCount] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(isCompleted);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isExpanded, setIsExpanded] = useState(autoExpand);

  // Keep track of previous autoExpand value to prevent infinite loops
  const prevAutoExpandRef = useRef(autoExpand);

  // Track if this is the first render
  const isFirstRenderRef = useRef(true);

  // Current UI state to prevent multiple buttons from appearing
  const [currentState, setCurrentState] = useState<
    "initial" | "incorrect" | "tutor" | "completed"
  >(isCompleted ? "completed" : "initial");

  // Initialize component state based on props
  useEffect(() => {
    // If the exercise is completed, reveal the solution
    if (isCompleted) {
      setIsRevealed(true);
      setExerciseCompleted(true);
      setCurrentState("completed");

      // Auto-collapse completed exercises unless it's marked to be expanded
      if (!autoExpand && wasCorrect && !isFirstRenderRef.current) {
        setIsExpanded(false);
      }

      // If it was incorrect, show the tutor options
      if (!wasCorrect) {
        setIsIncorrect(true);

        // Set appropriate state based on provided tutorState
        if (tutorState === "showTutor") {
          setShowTutor(true);
          setCurrentState("tutor");
        } else if (tutorState === "showOptions") {
          // This ensures that retrying is possible even after page reload
          setIsIncorrect(true);
          setShowTutor(false);
          setCurrentState("incorrect");
        }
      }
    }

    // After first render, mark it as not first render anymore
    isFirstRenderRef.current = false;
  }, [isCompleted, wasCorrect, tutorState, autoExpand]);

  // Handle expanded state changes when autoExpand prop changes
  useEffect(() => {
    // Only update if autoExpand actually changed and is not first render
    if (prevAutoExpandRef.current !== autoExpand && !isFirstRenderRef.current) {
      setIsExpanded(autoExpand);

      if (autoExpand) {
        // Add a slight delay to ensure the component is fully rendered before scrolling
        setTimeout(() => {
          if (exerciseRef.current) {
            exerciseRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);
      }
    }

    // Always update the ref to current value
    prevAutoExpandRef.current = autoExpand;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExpand]);

  // Check if exercise is flagged
  useEffect(() => {
    const checkIfExerciseFlagged = async () => {
      try {
        const response = await fetch(
          `/api/exercises/flag-exercise?exerciseId=${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsFlagged(data.flagged);
        }
      } catch (error) {
        console.error("Error checking if exercise is flagged:", error);
      }
    };

    checkIfExerciseFlagged();
  }, [id]);

  // Toggle flag status
  const handleToggleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const response = await fetch("/api/exercises/flag-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFlagged(data.flagged);
      }
    } catch (error) {
      console.error("Error toggling exercise flag:", error);
    }
  };

  // Toggle solution visibility
  const handleRevealSolution = () => {
    if (!exerciseCompleted) {
      setIsRevealed((prev) => !prev);
    }
  };

  // Handle marking as correct
  const handleMarkCorrect = async () => {
    await onMarkCorrect(id, true, attemptCount);
    setExerciseCompleted(true);
    setIsIncorrect(false);
    setCurrentState("completed");

    // Notify parent component that this exercise is complete
    if (onExerciseComplete) {
      onExerciseComplete(id, true);
    }

    // Auto-collapse after marking as correct (with delay to show completion)
    setTimeout(() => {
      setIsExpanded(false);
    }, 400);
  };

  // Handle marking as incorrect
  const handleMarkIncorrect = () => {
    onMarkCorrect(id, false, attemptCount)
      .then(() => {
        console.log(
          `Exercise ${id} marked as incorrect, attempt: ${attemptCount}`
        );
      })
      .catch((error) => {
        console.error("Failed to record incorrect attempt:", error);
      });

    setIsIncorrect(true);
    setCurrentState("incorrect");

    // Notify parent component that this exercise is marked incorrect
    if (onExerciseComplete) {
      onExerciseComplete(id, false);
    }
  };

  // Handle retry after getting it wrong
  const handleRetry = () => {
    setIsRevealed(false);
    setIsIncorrect(false);
    setShowTutor(false);
    setExerciseCompleted(false);
    setAttemptCount((prev) => prev + 1);
    setCurrentState("initial");
  };

  // Handle showing the tutor
  const handleShowTutor = () => {
    setShowTutor(true);
    setCurrentState("tutor");
  };

  // Handle marking as understood after tutor help
  const handleUnderstoodAfterHelp = async () => {
    await onMarkCorrect(id, true, attemptCount);
    setExerciseCompleted(true);
    setIsIncorrect(false);
    setShowTutor(false);
    setCurrentState("completed");

    // Notify parent component that this exercise is complete
    if (onExerciseComplete) {
      onExerciseComplete(id, true);
    }

    // Auto-collapse after marking as correct (with delay to show completion)
    setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  // Handle not understood after tutor help
  const handleNotUnderstood = () => {
    setShowTutor(false);
    setCurrentState("incorrect");
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div ref={exerciseRef} className="border-b border-border last:border-0">
      {/* Exercise header - always visible */}
      <div
        className={cn(
          "py-4 px-1 flex justify-between items-center cursor-pointer",
          isExpanded ? "border-b border-border/50" : ""
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium",
              exerciseCompleted && wasCorrect
                ? "bg-green-500/10 text-green-600"
                : exerciseCompleted && !wasCorrect
                ? "bg-amber-500/10 text-amber-600"
                : "bg-primary/10 text-primary"
            )}
          >
            {number}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {exerciseCompleted && wasCorrect && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <button
            onClick={handleToggleFlag}
            className={cn(
              "p-1.5 hover:text-yellow-500 cursor-pointer hover:scale-105 transition-colors",
              isFlagged ? "text-yellow-500" : "text-muted-foreground"
            )}
          >
            <Star
              className="h-4 w-4"
              fill={isFlagged ? "currentColor" : "none"}
            />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Exercise content - only visible when expanded, with animations */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-4 space-y-6">
              {/* Question */}
              <div className="prose prose-sm dark:prose-invert mt-4">
                {question.split("\n").map((line, index) => (
                  <div key={index} className="mb-2">
                    <MathRenderer content={line} />
                  </div>
                ))}
              </div>

              {/* Solution Box */}
              <div
                onClick={handleRevealSolution}
                className={cn(
                  "bg-muted/30 border border-border rounded-md p-4 mb-4 transition-all duration-200",
                  !exerciseCompleted && "cursor-pointer",
                  !isRevealed && !exerciseCompleted && "blur-sm select-none"
                )}
              >
                <h4 className="text-sm font-semibold mb-3 text-primary">
                  Soluzione
                </h4>
                <div className="prose prose-sm dark:prose-invert">
                  {solution.split("\n").map((line, index) => (
                    <div key={index} className="mb-2">
                      <MathRenderer content={line} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional UI based on exercise state */}
              <AnimatePresence mode="wait">
                {/* Case 1: Initial buttons when solution is revealed but not yet marked */}
                {isRevealed &&
                  !exerciseCompleted &&
                  !isIncorrect &&
                  currentState === "initial" && (
                    <motion.div
                      key="initial-buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          onClick={handleMarkIncorrect}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Non ho capito
                        </Button>
                        <Button
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-600 dark:text-green-500 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                          onClick={handleMarkCorrect}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Ho capito
                        </Button>
                      </div>
                    </motion.div>
                  )}

                {/* Case 2: Showing retry or tutor options when marked as incorrect */}
                {isIncorrect && currentState === "incorrect" && (
                  <motion.div
                    key="retry-options"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={cn(
                        !isCompleted && "text-muted-foreground text-sm mb-3",
                        isCompleted &&
                          "text-muted-foreground dark:text-amber-500 text-sm mb-3"
                      )}
                    >
                      {isCompleted
                        ? "Vedo che stai avendo difficoltà con questo esercizio."
                        : "Non hai capito questo esercizio. Cosa vuoi fare?"}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={handleRetry}
                      >
                        Riprova
                      </Button>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        onClick={handleShowTutor}
                      >
                        <MessageSquareText className="h-4 w-4 mr-2" />
                        Tutor
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Case 3: Showing suggestion when tutor help is requested */}
                {currentState === "tutor" && (
                  <motion.div
                    key="tutor-help"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="text-sm text-start">
                      Dopo l'aiuto del Tutor, hai capito l'esercizio?
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        onClick={handleNotUnderstood}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Non ancora
                      </Button>
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-600 dark:text-green-500 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                        onClick={handleUnderstoodAfterHelp}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Sì, ho capito
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
