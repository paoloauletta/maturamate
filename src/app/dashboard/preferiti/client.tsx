/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  BookOpen,
  BookText,
  Filter,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import MathRenderer from "@/app/components/mathRenderer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FavoriteExerciseCard from "@/app/components/exercises/FavoriteExerciseCard";
import MobileExerciseItem from "@/app/components/exercises/MobileExerciseItem";
import MobileExerciseView from "@/app/components/exercises/MobileExerciseView";
import { AnimatePresence, motion } from "framer-motion";

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

// Define more specific types for question and solution data
export interface ContentData {
  text?: string;
  html?: string;
  [key: string]: unknown; // Allow for other properties
}

// Type for content that can be either a string, an array of strings, or an object with specific properties
export type ContentType = string | string[] | ContentData;

export interface FlaggedCard {
  id: string;
  description: string;
  difficulty: number;
  subtopic_id: string | null;
  subtopic_name: string | null;
  topic_id: string | null;
  topic_name: string | null;
  created_at: string | Date;
  is_completed?: boolean;
  total_exercises?: number;
  completed_exercises?: number;
}

export interface FlaggedExercise {
  id: string;
  question_data: ContentType;
  solution_data: ContentType;
  exercise_card_id: string;
  card_description: string;
  difficulty: number;
  subtopic_id: string | null;
  subtopic_name: string | null;
  topic_id: string | null;
  topic_name: string | null;
  created_at: string | Date;
}

export interface FavoritesClientProps {
  flaggedCards: FlaggedCard[];
  flaggedExercises: FlaggedExercise[];
}

export default function FavoritesClient({
  flaggedCards,
  flaggedExercises,
}: FavoritesClientProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("cards");
  const [localFlaggedCards, setLocalFlaggedCards] =
    useState<FlaggedCard[]>(flaggedCards);
  const [localFlaggedExercises, setLocalFlaggedExercises] =
    useState<FlaggedExercise[]>(flaggedExercises);

  // The completion data is already fetched from the server-side in page.tsx
  // No need to fetch it again with an API call

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<string | null>(null);

  // Handle unflagging a card
  const handleUnflagCard = async (cardId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    e.stopPropagation();

    try {
      const response = await fetch("/api/exercises/flag-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId,
        }),
      });

      if (response.ok) {
        // Remove from local state
        setLocalFlaggedCards((prev) =>
          prev.filter((card) => card.id !== cardId)
        );
      }
    } catch (error) {
      console.error("Error unflagging card:", error);
    }
  };

  // Handle unflagging an exercise
  const handleUnflagExercise = async (
    exerciseId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    e.stopPropagation();

    try {
      const response = await fetch("/api/exercises/flag-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId,
        }),
      });

      if (response.ok) {
        // Remove from local state
        setLocalFlaggedExercises((prev) =>
          prev.filter((exercise) => exercise.id !== exerciseId)
        );
      }
    } catch (error) {
      console.error("Error unflagging exercise:", error);
    }
  };

  // Function to format question data for display
  const formatContent = (data: ContentType): string => {
    if (!data) return "";

    if (typeof data === "string") {
      return data;
    } else if (Array.isArray(data)) {
      // Handle array of strings - join them with line breaks
      return data.join("\n");
    } else if (data.text) {
      return data.text;
    } else if (data.html) {
      // Simple extraction of text from HTML
      return data.html.replace(/<[^>]*>/g, "");
    } else {
      return JSON.stringify(data);
    }
  };

  // Group cards by topic for better organization
  const cardsByTopic: Record<string, FlaggedCard[]> = {};
  localFlaggedCards.forEach((card) => {
    const topicId = card.topic_id || "unknown";
    if (!cardsByTopic[topicId]) {
      cardsByTopic[topicId] = [];
    }
    cardsByTopic[topicId].push(card);
  });

  // Group exercises by topic too
  const exercisesByTopic: Record<string, FlaggedExercise[]> = {};
  localFlaggedExercises.forEach((exercise) => {
    const topicId = exercise.topic_id || "unknown";
    if (!exercisesByTopic[topicId]) {
      exercisesByTopic[topicId] = [];
    }
    exercisesByTopic[topicId].push(exercise);
  });

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

  // Filter the cards and exercises based on the selected filters
  const filteredCards = localFlaggedCards.filter((card) => {
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
  });

  // Filter the exercises
  const filteredExercises = localFlaggedExercises.filter((exercise) => {
    // Apply difficulty filter
    if (difficultyFilter !== null && exercise.difficulty !== difficultyFilter) {
      return false;
    }
    // NOTE: We don't have completion status for individual exercises in this context

    return true;
  });

  // Re-group filtered cards by topic
  const filteredCardsByTopic: Record<string, FlaggedCard[]> = {};
  filteredCards.forEach((card) => {
    const topicId = card.topic_id || "unknown";
    if (!filteredCardsByTopic[topicId]) {
      filteredCardsByTopic[topicId] = [];
    }
    filteredCardsByTopic[topicId].push(card);
  });

  // Re-group filtered exercises by topic
  const filteredExercisesByTopic: Record<string, FlaggedExercise[]> = {};
  filteredExercises.forEach((exercise) => {
    const topicId = exercise.topic_id || "unknown";
    if (!filteredExercisesByTopic[topicId]) {
      filteredExercisesByTopic[topicId] = [];
    }
    filteredExercisesByTopic[topicId].push(exercise);
  });

  // New component for favorite exercise with expandable view
  function FavoriteExerciseCollapsible({
    exercise,
    onUnflag,
  }: {
    exercise: FlaggedExercise;
    onUnflag: (exerciseId: string, e: React.MouseEvent) => Promise<void>;
  }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
    };

    // Format content for display
    const formatQuestionData = (data: ContentType): string => {
      if (!data) return "";

      if (typeof data === "string") {
        return data;
      } else if (Array.isArray(data)) {
        return data.join("\n");
      } else if (data.text) {
        return data.text;
      } else if (data.html) {
        return data.html;
      } else {
        return JSON.stringify(data);
      }
    };

    const formattedQuestion = formatQuestionData(exercise.question_data);
    const formattedSolution = formatQuestionData(exercise.solution_data);

    return (
      <div className="border-b border-border last:border-0">
        {/* Header - always visible */}
        <div
          className={cn(
            "py-4 px-1 flex justify-between items-center cursor-pointer",
            isExpanded ? "border-b border-border/50" : ""
          )}
          onClick={toggleExpanded}
        >
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground ">
              {exercise.topic_name} &gt; {exercise.subtopic_name}
            </span>
            <h3 className="font-semibold text-base pr-6">
              {exercise.card_description}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(exercise.difficulty)].map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    exercise.difficulty === 1
                      ? "bg-green-500"
                      : exercise.difficulty === 2
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              ))}
              {[...Array(3 - exercise.difficulty)].map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-muted" />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onUnflag(exercise.id, e);
              }}
              className="text-yellow-500 p-1 rounded-full hover:scale-110 transition-transform"
            >
              <Star className="h-4 w-4 cursor-pointer" fill="currentColor" />
            </button>

            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-1 py-4 pb-4 space-y-4">
                {/* Question */}
                <div>
                  <div className="prose prose-sm dark:prose-invert">
                    {formattedQuestion.split("\n").map((line, index) => (
                      <div key={index} className="mb-2">
                        <MathRenderer content={line} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution */}
                <div className="bg-muted/30 border border-border p-4 rounded-md">
                  <h4 className="text-sm font-semibold mb-2 text-primary">
                    Soluzione
                  </h4>
                  <div className="prose prose-sm dark:prose-invert">
                    {formattedSolution.split("\n").map((line, index) => (
                      <div key={index} className="mb-2">
                        <MathRenderer content={line} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* View in context button */}
                <div className="flex justify-end">
                  <Button variant="outline">
                    <Link
                      href={`/dashboard/esercizi/card/${exercise.exercise_card_id}?from=preferiti`}
                      className="text-sm text-foreground"
                    >
                      Vedi nella scheda completa
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop favorite exercise card (no gradient, with question and solution)
  function DesktopFavoriteExercise({
    exercise,
    onUnflag,
  }: {
    exercise: FlaggedExercise;
    onUnflag: (exerciseId: string, e: React.MouseEvent) => Promise<void>;
  }) {
    return (
      <Card className="h-full overflow-hidden transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardDescription>
              <div className="text-xs text-muted-foreground">
                {exercise.topic_name} &gt; {exercise.subtopic_name}
              </div>
            </CardDescription>
            <button
              className="text-yellow-500 p-1 rounded-full hover:scale-110 transition-transform"
              onClick={(e) => onUnflag(exercise.id, e)}
            >
              <Star className="w-4 h-4" fill="currentColor cursor-pointer" />
            </button>
          </div>
          <h3 className="font-semibold text-base">
            {exercise.card_description}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Section */}
          <div className="border-l-2 border-primary pl-4">
            <h4 className="text-sm font-semibold mb-2">Domanda</h4>
            <div className="prose prose-sm dark:prose-invert max-h-20 overflow-hidden">
              <MathRenderer content={formatContent(exercise.question_data)} />
            </div>
          </div>

          {/* Solution Section */}
          <div className="border-l-2 border-primary pl-4">
            <h4 className="text-sm font-semibold mb-2">Soluzione</h4>
            <div className="prose prose-sm dark:prose-invert max-h-20 overflow-hidden">
              <MathRenderer content={formatContent(exercise.solution_data)} />
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-1">
              {[...Array(exercise.difficulty)].map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    exercise.difficulty === 1
                      ? "bg-green-500"
                      : exercise.difficulty === 2
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              ))}
              {[...Array(3 - exercise.difficulty)].map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-muted" />
              ))}
            </div>
            <Button variant="outline">
              <Link
                href={`/dashboard/esercizi/card/${exercise.exercise_card_id}?from=preferiti`}
                className="text-sm text-foreground"
              >
                Vedi nella scheda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4 lg:border-none lg:pb-0">
        <div>
          <h1 className="text-4xl font-bold">I miei preferiti</h1>
          <p className="text-base text-muted-foreground mt-2 lg:block hidden">
            Esercizi e schede che hai contrassegnato come preferiti
          </p>
        </div>

        {/* Add filter button */}
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

      {/* Tabs Section with Icons */}
      <div className="flex border-b mb-6">
        <button
          className={`pb-2 px-4 text-center flex items-center gap-2 ${
            activeTab === "cards"
              ? "border-b-2 border-primary font-medium text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("cards")}
        >
          <BookText className="h-4 w-4" />
          <span>Schede</span>
          <Badge variant="secondary" className="ml-1">
            {filteredCards.length}
          </Badge>
        </button>
        <button
          className={`pb-2 px-4 text-center flex items-center gap-2 ${
            activeTab === "exercises"
              ? "border-b-2 border-primary font-medium text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("exercises")}
        >
          <BookOpen className="h-4 w-4" />
          <span>Esercizi</span>
          <Badge variant="secondary" className="ml-1">
            {filteredExercises.length}
          </Badge>
        </button>
      </div>

      {/* Cards View */}
      {activeTab === "cards" && (
        <>
          {Object.keys(filteredCardsByTopic).length > 0 ? (
            Object.entries(filteredCardsByTopic).map(([topicId, cards]) => (
              <div key={topicId} className="mb-10">
                <h2 className="text-3xl text-foreground/95 font-semibold mb-4 border-b border-muted pb-2">
                  {cards[0].topic_name || "Argomento sconosciuto"}
                </h2>
                {isMobile ? (
                  // Mobile view using MobileExerciseItem
                  <div className="space-y-0 divide-y divide-border border-b border-border overflow-hidden">
                    {cards.map((card) => (
                      <MobileExerciseItem
                        key={card.id}
                        id={card.id}
                        topicName={card.topic_name || ""}
                        topicOrder={null}
                        subtopicName={card.subtopic_name || ""}
                        subtopicOrder={null}
                        description={card.description}
                        difficulty={card.difficulty}
                        isCompleted={card.is_completed || false}
                        totalExercises={card.total_exercises || 0}
                        completedExercises={card.completed_exercises || 0}
                        customLinkHref={`/dashboard/esercizi/card/${card.id}?from=preferiti`}
                      />
                    ))}
                  </div>
                ) : (
                  // Desktop view using cards
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                      <FavoriteExerciseCard
                        key={card.id}
                        id={card.id}
                        topicName={card.topic_name || ""}
                        subtopicName={card.subtopic_name || ""}
                        description={card.description}
                        difficulty={card.difficulty}
                        isCompleted={card.is_completed || false}
                        totalExercises={card.total_exercises || 0}
                        completedExercises={card.completed_exercises || 0}
                        onUnflag={async (id, e) => {
                          await handleUnflagCard(id, e);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            // No cards message
            <div className="text-center py-10 bg-muted/40 rounded-lg border border-border">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">
                Nessuna scheda nei preferiti
              </h3>
              <p className="text-muted-foreground mb-5">
                Non hai ancora aggiunto schede ai preferiti.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/esercizi">Vai agli esercizi</Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Exercises View */}
      {activeTab === "exercises" && (
        <>
          {Object.keys(filteredExercisesByTopic).length > 0 ? (
            Object.entries(filteredExercisesByTopic).map(
              ([topicId, exercises]) => (
                <div key={topicId} className="mb-10">
                  <h2 className="text-3xl text-foreground/95 font-semibold mb-4 border-b border-muted pb-2">
                    {exercises[0].topic_name || "Argomento sconosciuto"}
                  </h2>
                  {isMobile ? (
                    // Mobile view using collapsible exercises
                    <div className="space-y-0 divide-y border-b border-border overflow-hidden">
                      {exercises.map((exercise) => (
                        <FavoriteExerciseCollapsible
                          key={exercise.id}
                          exercise={exercise}
                          onUnflag={handleUnflagExercise}
                        />
                      ))}
                    </div>
                  ) : (
                    // Desktop view with 4 columns
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {exercises.map((exercise) => (
                        <DesktopFavoriteExercise
                          key={exercise.id}
                          exercise={exercise}
                          onUnflag={handleUnflagExercise}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            <div className="text-center py-10 bg-muted/40 rounded-lg border border-border">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">
                Nessun esercizio nei preferiti
              </h3>
              <p className="text-muted-foreground mb-5">
                Non hai ancora aggiunto esercizi ai preferiti.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/esercizi">Vai agli esercizi</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
