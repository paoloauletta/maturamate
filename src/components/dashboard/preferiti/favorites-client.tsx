/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  BookOpen,
  BookText,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Clock,
  School,
  Calendar,
} from "lucide-react";
import { MathRenderer } from "@/components/renderer/math-renderer-client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FavoriteExerciseCard } from "@/components/exercises/favorite-exercise-card-client";
import { MobileExerciseItem } from "@/components/exercises/mobile-exercise-item-client";
import { AnimatePresence, motion } from "framer-motion";
import { DataLoading } from "@/components/loading/data-loading-client";
import { useApiData, useMutation } from "@/lib/client/api";

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

export interface FlaggedSimulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  year: number;
  subject: string;
  time_in_min: number;
  is_complete: boolean;
  created_at: string | Date;
  is_completed: boolean;
  is_started: boolean;
}

export function FavoritesList() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("cards");

  // Use our new API utilities for data fetching
  const {
    data: flaggedCards = [],
    isLoading: isLoadingCards,
    error: errorCards,
  } = useApiData<FlaggedCard[]>("/api/exercises/flagged");

  const {
    data: flaggedExercises = [],
    isLoading: isLoadingExercises,
    error: errorExercises,
  } = useApiData<FlaggedExercise[]>("/api/exercises/flagged-exercises");

  const {
    data: flaggedSimulations = [],
    isLoading: isLoadingSimulations,
    error: errorSimulations,
  } = useApiData<FlaggedSimulation[]>("/api/simulations/flagged");

  // For expandable exercise items
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );

  // Use our mutation utility for unflagging
  const { mutate: unflagCard, isLoading: isUnflaggingCard } = useMutation<
    { success: boolean },
    { cardId: string }
  >("/api/exercises/flag-card");
  const { mutate: unflagExercise, isLoading: isUnflaggingExercise } =
    useMutation<{ success: boolean }, { exerciseId: string }>(
      "/api/exercises/flag-exercise"
    );
  const { mutate: unflagSimulation, isLoading: isUnflaggingSimulation } =
    useMutation<{ success: boolean }, { simulationId: string }>(
      "/api/simulations/flag"
    );

  // Handle unflagging a card with optimistic updates
  const handleUnflagCard = async (cardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await unflagCard({ cardId });
    } catch (error) {
      console.error("Error unflagging card:", error);
    }
  };

  // Handle unflagging an exercise with optimistic updates
  const handleUnflagExercise = async (
    exerciseId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await unflagExercise({ exerciseId });
    } catch (error) {
      console.error("Error unflagging exercise:", error);
    }
  };

  // Handle unflagging a simulation with optimistic updates
  const handleUnflagSimulation = async (
    simulationId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await unflagSimulation({ simulationId });
    } catch (error) {
      console.error("Error unflagging simulation:", error);
    }
  };

  const formatContent = (data: ContentType): string => {
    if (typeof data === "string") {
      return data;
    } else if (Array.isArray(data)) {
      return data.join(" ");
    } else if (data && typeof data === "object") {
      if (data.text) return data.text as string;
      if (data.html) return data.html as string;
    }
    return "Contenuto non disponibile";
  };

  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  };

  // Ensure all exercises are expanded by default in favorites
  useEffect(() => {
    if (
      flaggedExercises &&
      flaggedExercises.length > 0 &&
      expandedExerciseId === null
    ) {
      // Set all exercises as expanded initially
      setExpandedExerciseId(flaggedExercises[0].id);
    }
  }, [flaggedExercises]);

  const formatTimeInHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderLoadingStates = () => (
    <div className="space-y-4">
      <DataLoading
        data={flaggedCards}
        isLoading={isLoadingCards}
        error={errorCards}
        loadingText="Caricamento schede..."
      >
        {(data) => <></>}
      </DataLoading>

      <DataLoading
        data={flaggedExercises}
        isLoading={isLoadingExercises}
        error={errorExercises}
        loadingText="Caricamento esercizi..."
      >
        {(data) => <></>}
      </DataLoading>

      <DataLoading
        data={flaggedSimulations}
        isLoading={isLoadingSimulations}
        error={errorSimulations}
        loadingText="Caricamento simulazioni..."
      >
        {(data) => <></>}
      </DataLoading>
    </div>
  );

  // Rest of rendering code remains the same...
  const renderContent = () => {
    // If everything is loading, show loading states
    if (isLoadingCards && isLoadingExercises && isLoadingSimulations) {
      return renderLoadingStates();
    }

    // If cards are selected and loaded
    if (activeTab === "cards") {
      return (
        <DataLoading
          data={flaggedCards}
          isLoading={isLoadingCards}
          error={errorCards}
          loadingText="Caricamento schede..."
          emptyMessage="Non hai segnato nessuna scheda come preferita."
        >
          {(cards) => (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <FavoriteExerciseCard
                  key={card.id}
                  card={card}
                  onUnflag={(e) => handleUnflagCard(card.id, e)}
                />
              ))}
            </div>
          )}
        </DataLoading>
      );
    }

    // If exercises are selected and loaded
    if (activeTab === "exercises") {
      return (
        <DataLoading
          data={flaggedExercises}
          isLoading={isLoadingExercises}
          error={errorExercises}
          loadingText="Caricamento esercizi..."
          emptyMessage="Non hai segnato nessun esercizio come preferito."
        >
          {(exercises) => (
            <div className="space-y-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {isMobile ? (
                    <MobileExerciseItem
                      exercise={exercise}
                      isExpanded={expandedExerciseId === exercise.id}
                      onToggleExpand={() => toggleExerciseExpand(exercise.id)}
                      onUnflag={(e) => handleUnflagExercise(exercise.id, e)}
                    />
                  ) : (
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {exercise.topic_name && (
                                <Badge
                                  variant="secondary"
                                  className="font-normal"
                                >
                                  {exercise.topic_name}
                                </Badge>
                              )}
                              {exercise.subtopic_name && (
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {exercise.subtopic_name}
                                </Badge>
                              )}
                              <Badge
                                className={cn(
                                  "font-normal",
                                  exercise.difficulty === 1 &&
                                    "bg-green-500 hover:bg-green-600",
                                  exercise.difficulty === 2 &&
                                    "bg-yellow-500 hover:bg-yellow-600",
                                  exercise.difficulty === 3 &&
                                    "bg-red-500 hover:bg-red-600"
                                )}
                              >
                                Difficoltà: {exercise.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl font-medium">
                              {exercise.card_description}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            onClick={(e) =>
                              handleUnflagExercise(exercise.id, e)
                            }
                          >
                            <Star className="h-5 w-5 fill-current" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="mt-2 space-y-4">
                          <div>
                            <h4 className="font-medium mb-1">Domanda:</h4>
                            <div className="bg-muted p-3 rounded-md">
                              <MathRenderer
                                content={formatContent(exercise.question_data)}
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Soluzione:</h4>
                            <div className="bg-muted p-3 rounded-md">
                              <MathRenderer
                                content={formatContent(exercise.solution_data)}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Link
                              href={`/dashboard/esercizi/card/${exercise.exercise_card_id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              Vedi tutte le domande in questa scheda
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </DataLoading>
      );
    }

    // If simulations are selected and loaded
    return (
      <DataLoading
        data={flaggedSimulations}
        isLoading={isLoadingSimulations}
        error={errorSimulations}
        loadingText="Caricamento simulazioni..."
        emptyMessage="Non hai segnato nessuna simulazione come preferita."
      >
        {(simulations) => (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {simulations.map((simulation) => (
              <Card key={simulation.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="font-normal">
                          {simulation.subject}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-normal flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          {simulation.year}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-normal flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {formatTimeInHours(simulation.time_in_min)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-medium">
                        {simulation.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={(e) => handleUnflagSimulation(simulation.id, e)}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-4">
                    {simulation.description}
                  </CardDescription>

                  <div className="flex justify-between items-center pt-2">
                    {simulation.is_started ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-normal flex items-center gap-1",
                          simulation.is_completed
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {simulation.is_completed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Completata
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> In corso
                          </>
                        )}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-normal flex items-center gap-1"
                      >
                        <School className="h-3 w-3" /> Non iniziata
                      </Badge>
                    )}

                    <Link
                      href={`/dashboard/simulazioni/${simulation.id}`}
                      passHref
                    >
                      <Button size="sm">
                        {simulation.is_started
                          ? "Continua"
                          : "Inizia Simulazione"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DataLoading>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle>Preferiti</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-b px-6 pb-2">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "cards" ? "default" : "ghost"}
                className="px-4"
                onClick={() => setActiveTab("cards")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Schede
              </Button>
              <Button
                variant={activeTab === "exercises" ? "default" : "ghost"}
                className="px-4"
                onClick={() => setActiveTab("exercises")}
              >
                <BookText className="h-4 w-4 mr-2" />
                Esercizi
              </Button>
              <Button
                variant={activeTab === "simulations" ? "default" : "ghost"}
                className="px-4"
                onClick={() => setActiveTab("simulations")}
              >
                <School className="h-4 w-4 mr-2" />
                Simulazioni
              </Button>
            </div>
          </div>
          <div className="p-6">{renderContent()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
