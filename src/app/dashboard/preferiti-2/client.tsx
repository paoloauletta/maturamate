/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  BookOpen,
  BookText,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MathRenderer from "@/app/components/renderer/mathRenderer";
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
import dynamic from "next/dynamic";
import MobileExerciseItem from "@/app/components/exercises/MobileExerciseItem";

// Dynamically import MobileExerciseView to reduce initial bundle size
const MobileExerciseView = dynamic(
  () =>
    import("@/app/components/exercises/MobileExerciseView").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

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

  const [isMobile, setIsMobile] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    return true;
  });

  // Filter the exercises
  const filteredExercises = localFlaggedExercises.filter((exercise) => {
    // Apply difficulty filter
    if (difficultyFilter !== null && exercise.difficulty !== difficultyFilter) {
      return false;
    }
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

  // Filter and render the exercises by topic
  const renderExercises = () => {
    if (localFlaggedExercises.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            Non hai ancora salvato alcun esercizio singolo tra i preferiti.
          </div>
        </div>
      );
    }

    // Apply filters
    const filteredExercises = localFlaggedExercises.filter((exercise) => {
      // Apply difficulty filter if selected
      if (
        difficultyFilter !== null &&
        exercise.difficulty !== difficultyFilter
      ) {
        return false;
      }
      return true;
    });

    if (filteredExercises.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            Nessun esercizio corrisponde ai filtri selezionati.
          </div>
        </div>
      );
    }

    // Group by topic for desktop view
    if (!isMobile) {
      return Object.entries(exercisesByTopic).map(([topicId, exercises]) => {
        // Skip topics with no exercises after filtering
        const filteredTopicExercises = exercises.filter((exercise) => {
          if (
            difficultyFilter !== null &&
            exercise.difficulty !== difficultyFilter
          ) {
            return false;
          }
          return true;
        });

        if (filteredTopicExercises.length === 0) {
          return null;
        }

        // Get the topic name from the first exercise
        const topicName =
          filteredTopicExercises[0].topic_name || "Argomento sconosciuto";

        return (
          <div key={topicId} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{topicName}</h3>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {filteredTopicExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onUnflag={handleUnflagExercise}
                />
              ))}
            </div>
          </div>
        );
      });
    } else {
      // Mobile view with accordion-style exercises
      return (
        <div className="flex flex-col space-y-1 mb-4">
          {filteredExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="w-full">
                <MobileExerciseView
                  id={exercise.id}
                  number={index + 1}
                  question={formatContent(exercise.question_data)}
                  solution={formatContent(exercise.solution_data)}
                  onMarkCorrect={async () => {}}
                  autoExpand={true}
                  onExerciseComplete={() => {}}
                  inFavouritesPage={true}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  // Filter and render the cards by topic
  const renderCards = () => {
    if (localFlaggedCards.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium mb-2">
              Nessuna scheda preferita
            </h3>
            <p>
              Aggiungi schede ai preferiti facendo clic sull'icona a forma di
              stella.
            </p>
            <Link href="/dashboard/esercizi" passHref>
              <Button className="mt-4">Esplora schede di esercizi</Button>
            </Link>
          </div>
        </div>
      );
    }

    // Apply filters
    const filteredCards = localFlaggedCards.filter((card) => {
      // Apply difficulty filter if selected
      if (difficultyFilter !== null && card.difficulty !== difficultyFilter) {
        return false;
      }
      // Apply completion filter if selected
      if (completionFilter === "completed" && !card.is_completed) {
        return false;
      }
      if (completionFilter === "incomplete" && card.is_completed) {
        return false;
      }
      return true;
    });

    if (filteredCards.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium mb-2">
              Nessuna scheda corrisponde ai filtri selezionati
            </h3>
            <p className="mb-6">
              Prova a modificare i filtri per visualizzare i tuoi preferiti.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Rimuovi filtri
            </Button>
          </div>
        </div>
      );
    }

    // Create filtered topics
    const filteredCardsByTopic: Record<string, FlaggedCard[]> = {};
    filteredCards.forEach((card) => {
      const topicId = card.topic_id || "unknown";
      if (!filteredCardsByTopic[topicId]) {
        filteredCardsByTopic[topicId] = [];
      }
      filteredCardsByTopic[topicId].push(card);
    });

    // For mobile view, use MobileExerciseItem similar to the exercises page
    if (isMobile) {
      return Object.entries(filteredCardsByTopic).map(([topicId, cards]) => (
        <div key={topicId} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {cards[0]?.topic_name || "Altro"}
          </h3>
          <div className="space-y-0 rounded-md overflow-hidden">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border-b border-foreground/10 last:border-b-0"
              >
                <MobileExerciseItem
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
                  disableStar={true}
                  customLinkHref={`/dashboard/esercizi/card/${card.id}?from=preferiti`}
                />
              </div>
            ))}
          </div>
        </div>
      ));
    }

    // Desktop view remains unchanged
    return Object.entries(filteredCardsByTopic).map(([topicId, cards]) => (
      <div key={topicId} className="mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {cards[0]?.topic_name || "Altro"}
        </h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/dashboard/esercizi/card/${card.id}?from=preferiti`}
              className="h-full"
            >
              <Card className="h-full transition-all duration-300 hover:ring-primary/50 hover:ring-1 flex flex-col relative">
                <CardHeader className="pb-2">
                  <div className="flex w-full justify-between items-center mb-2">
                    <div className="text-xs text-muted-foreground">
                      {card.topic_name || ""} &gt; {card.subtopic_name || ""}
                    </div>
                    <div
                      className="rounded-full text-yellow-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={(e) => handleUnflagCard(card.id, e)}
                      title="Rimuovi dai preferiti"
                    >
                      <Star className="h-4 w-4" fill="currentColor" />
                    </div>
                  </div>
                  <CardDescription className="text-base font-medium pr-6">
                    <span className="line-clamp-2 overflow-hidden">
                      {card.description}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  {/* Difficulty indicators */}
                  <div className="flex gap-1 items-center">
                    {[...Array(card.difficulty)].map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          card.difficulty === 1
                            ? "bg-green-500 dark:bg-green-400"
                            : card.difficulty === 2
                            ? "bg-yellow-500 dark:bg-yellow-400"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                      />
                    ))}
                    {[...Array(3 - card.difficulty)].map((_, i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-muted" />
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                  <div className="flex items-center gap-1">
                    {card.is_completed ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completato</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Non completato</span>
                      </div>
                    )}
                  </div>

                  {/* Only show exercise counter if the card isn't fully completed and we have exercise data */}
                  {!card.is_completed &&
                    card.total_exercises &&
                    card.total_exercises > 0 && (
                      <div className="text-xs font-medium">
                        {card.completed_exercises || 0}/{card.total_exercises}
                      </div>
                    )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    ));
  };

  // Individual Exercise Card component
  function ExerciseCard({
    exercise,
    onUnflag,
  }: {
    exercise: FlaggedExercise;
    onUnflag: (id: string, e: React.MouseEvent) => Promise<void>;
  }) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:ring-primary/50 hover:ring-1">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium mb-1 block">
                Da: {exercise.card_description}
              </span>
              <CardDescription className="text-xs">
                {exercise.subtopic_name || ""}
              </CardDescription>
            </div>
            <Star
              className="h-5 w-5 text-yellow-500 hover:scale-110 transition-transform duration-200 cursor-pointer"
              fill="currentColor"
              onClick={(e) => onUnflag(exercise.id, e)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 rounded-md bg-muted/30 mb-4 border-l-4 border-muted">
            <h3 className="text-sm font-semibold mb-2">Domanda</h3>
            {formatContent(exercise.question_data)
              .split("\n")
              .map((line, index) => (
                <div key={`question-${exercise.id}-${index}`} className="mb-2">
                  <MathRenderer content={line} />
                </div>
              ))}
          </div>

          <div className="p-4 rounded-md bg-muted/20 border-l-4 border-primary/30">
            <h3 className="text-sm font-semibold mb-2">Soluzione</h3>
            {formatContent(exercise.solution_data)
              .split("\n")
              .map((line, index) => (
                <div key={`solution-${exercise.id}-${index}`} className="mb-2">
                  <MathRenderer content={line} />
                </div>
              ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center mt-2 text-sm">
              <div className="flex">
                {[...Array(exercise.difficulty)].map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full mr-1 ${
                      exercise.difficulty === 1
                        ? "bg-green-500"
                        : exercise.difficulty === 2
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Link
              href={`/dashboard/esercizi/card/${exercise.exercise_card_id}?from=preferiti`}
              passHref
            >
              <Button variant="outline" size="sm">
                Vai alla scheda completa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            I tuoi preferiti
          </h1>
          <p className="text-muted-foreground">
            Gli esercizi e le schede che hai salvato tra i preferiti
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="mt-4 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filtra</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Livello di difficoltà</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("difficulty", 1)}
                  className={cn(difficultyFilter === 1 && "bg-muted")}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Base</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("difficulty", 2)}
                  className={cn(difficultyFilter === 2 && "bg-muted")}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>Media</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("difficulty", 3)}
                  className={cn(difficultyFilter === 3 && "bg-muted")}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Avanzata</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {activeTab === "cards" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Stato completamento</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange("completion", "completed")
                      }
                      className={cn(
                        completionFilter === "completed" && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completati</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange("completion", "incomplete")
                      }
                      className={cn(
                        completionFilter === "incomplete" && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Non completati</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters}>
                Rimuovi filtri
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === "cards" ? "default" : "outline"}
          onClick={() => setActiveTab("cards")}
          className="flex-1 md:flex-none"
        >
          Schede
        </Button>
        <Button
          variant={activeTab === "exercises" ? "default" : "outline"}
          onClick={() => setActiveTab("exercises")}
          className="flex-1 md:flex-none"
        >
          Esercizi singoli
        </Button>
      </div>

      {/* Content based on active tab */}
      <div className="mb-8">
        {activeTab === "cards" ? renderCards() : renderExercises()}
      </div>
    </div>
  );
}
