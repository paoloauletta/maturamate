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
  Filter,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Clock,
  School,
  Calendar,
} from "lucide-react";
import MathRenderer from "@/app/components/mathRenderer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FavoriteExerciseCard from "@/app/components/exercises/FavoriteExerciseCard";
import MobileExerciseItem from "@/app/components/exercises/MobileExerciseItem";
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

export interface FavoritesClientProps {
  flaggedCards: FlaggedCard[];
  flaggedExercises: FlaggedExercise[];
  flaggedSimulations: FlaggedSimulation[];
}

export default function FavoritesClient({
  flaggedCards,
  flaggedExercises,
  flaggedSimulations,
}: FavoritesClientProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("cards");
  const [localFlaggedCards, setLocalFlaggedCards] =
    useState<FlaggedCard[]>(flaggedCards);
  const [localFlaggedExercises, setLocalFlaggedExercises] =
    useState<FlaggedExercise[]>(flaggedExercises);
  const [localFlaggedSimulations, setLocalFlaggedSimulations] =
    useState<FlaggedSimulation[]>(flaggedSimulations);

  // For expandable exercise items
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );

  // Handle unflagging a card
  const handleUnflagCard = async (cardId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
    e.preventDefault();
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
        setLocalFlaggedExercises((prev) =>
          prev.filter((exercise) => exercise.id !== exerciseId)
        );
      }
    } catch (error) {
      console.error("Error unflagging exercise:", error);
    }
  };

  // Handle unflagging a simulation
  const handleUnflagSimulation = async (
    simulationId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch("/api/simulations/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationId,
        }),
      });

      if (response.ok) {
        setLocalFlaggedSimulations((prev) =>
          prev.filter((simulation) => simulation.id !== simulationId)
        );
      }
    } catch (error) {
      console.error("Error unflagging simulation:", error);
    }
  };

  // Function to format question data for display
  const formatContent = (data: ContentType): string => {
    if (!data) return "";

    if (typeof data === "string") {
      return data;
    } else if (Array.isArray(data)) {
      return data.join("\n");
    } else if (data.text) {
      return data.text;
    } else if (data.html) {
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

  // Toggle expanded state for an exercise
  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExerciseId(
      expandedExerciseId === exerciseId ? null : exerciseId
    );
  };

  // Convert time in minutes to hours and minutes format
  const formatTimeInHours = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "ora" : "ore"}`;
    }

    return `${hours} ${hours === 1 ? "ora" : "ore"} e ${remainingMinutes} min`;
  };

  return (
    <div className="container max-w-full px-4 md:px-6">
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <h1 className="text-4xl font-bold">Preferiti</h1>
      </div>

      {/* Tabs for different favorite types - improved mobile layout */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeTab === "cards" ? "default" : "outline"}
          onClick={() => setActiveTab("cards")}
          className="flex items-center"
          size={isMobile ? "sm" : "default"}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Schede</span>
          {localFlaggedCards.length > 0 && (
            <Badge className="ml-1" variant="secondary">
              {localFlaggedCards.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "exercises" ? "default" : "outline"}
          onClick={() => setActiveTab("exercises")}
          className="flex items-center"
          size={isMobile ? "sm" : "default"}
        >
          <BookText className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Esercizi</span>
          {localFlaggedExercises.length > 0 && (
            <Badge className="ml-1" variant="secondary">
              {localFlaggedExercises.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "simulations" ? "default" : "outline"}
          onClick={() => setActiveTab("simulations")}
          className="flex items-center"
          size={isMobile ? "sm" : "default"}
        >
          <Clock className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Simulazioni</span>
          {localFlaggedSimulations.length > 0 && (
            <Badge className="ml-1" variant="secondary">
              {localFlaggedSimulations.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile-optimized content layout */}
      <div className="overflow-x-hidden w-full">
        {activeTab === "cards" && (
          <>
            {Object.keys(cardsByTopic).length > 0 ? (
              Object.entries(cardsByTopic).map(([topicId, cards]) => (
                <div key={topicId} className="mb-10">
                  <h2 className="text-xl md:text-3xl text-foreground/95 font-semibold mb-4 border-b border-muted pb-2">
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

        {activeTab === "exercises" && (
          <>
            {Object.keys(exercisesByTopic).length > 0 ? (
              Object.entries(exercisesByTopic).map(([topicId, exercises]) => (
                <div key={topicId} className="mb-10">
                  <h2 className="text-3xl text-foreground/95 font-semibold mb-4 border-b border-muted pb-2">
                    {exercises[0].topic_name || "Argomento sconosciuto"}
                  </h2>
                  {isMobile ? (
                    // Mobile view with expandable exercise items
                    <div className="space-y-0 divide-y divide-border border-b border-border overflow-hidden">
                      {exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="border-b border-border last:border-0"
                        >
                          <div
                            className={cn(
                              "py-4 px-1 flex justify-between items-center cursor-pointer",
                              expandedExerciseId === exercise.id
                                ? "border-b border-border/50"
                                : ""
                            )}
                            onClick={() => toggleExerciseExpand(exercise.id)}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                {exercise.topic_name} &gt;{" "}
                                {exercise.subtopic_name}
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
                                {[...Array(3 - exercise.difficulty)].map(
                                  (_, i) => (
                                    <span
                                      key={i}
                                      className="h-2 w-2 rounded-full bg-muted"
                                    />
                                  )
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleUnflagExercise(exercise.id, e);
                                }}
                                className="text-yellow-500 p-1 rounded-full hover:scale-110 transition-transform"
                              >
                                <Star
                                  className="h-4 w-4 cursor-pointer"
                                  fill="currentColor"
                                />
                              </button>

                              {expandedExerciseId === exercise.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedExerciseId === exercise.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-1 py-4 pb-4 space-y-4">
                                  <div>
                                    <div className="prose prose-sm dark:prose-invert">
                                      {formatContent(exercise.question_data)
                                        .split("\n")
                                        .map((line, index) => (
                                          <div key={index} className="mb-2">
                                            <MathRenderer content={line} />
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                  <div className="bg-muted/30 border border-border p-4 rounded-md">
                                    <h4 className="text-sm font-semibold mb-2 text-primary">
                                      Soluzione
                                    </h4>
                                    <div className="prose prose-sm dark:prose-invert">
                                      {formatContent(exercise.solution_data)
                                        .split("\n")
                                        .map((line, index) => (
                                          <div key={index} className="mb-2">
                                            <MathRenderer content={line} />
                                          </div>
                                        ))}
                                    </div>
                                  </div>

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
                      ))}
                    </div>
                  ) : (
                    // Desktop view with exercise cards
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exercises.map((exercise) => (
                        <Card
                          key={exercise.id}
                          className="h-full overflow-hidden transition-all"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardDescription>
                                <div className="text-xs text-muted-foreground">
                                  {exercise.topic_name} &gt;{" "}
                                  {exercise.subtopic_name}
                                </div>
                              </CardDescription>
                              <button
                                className="text-yellow-500 p-1 rounded-full hover:scale-110 transition-transform"
                                onClick={(e) =>
                                  handleUnflagExercise(exercise.id, e)
                                }
                              >
                                <Star
                                  className="w-4 h-4"
                                  fill="currentColor cursor-pointer"
                                />
                              </button>
                            </div>
                            <h3 className="font-semibold text-base">
                              {exercise.card_description}
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Question Section */}
                            <div className="border-l-2 border-primary pl-4">
                              <h4 className="text-sm font-semibold mb-2">
                                Domanda
                              </h4>
                              <div className="prose prose-sm dark:prose-invert max-h-20 overflow-hidden">
                                <MathRenderer
                                  content={formatContent(
                                    exercise.question_data
                                  )}
                                />
                              </div>
                            </div>

                            {/* Solution Section */}
                            <div className="border-l-2 border-primary pl-4">
                              <h4 className="text-sm font-semibold mb-2">
                                Soluzione
                              </h4>
                              <div className="prose prose-sm dark:prose-invert max-h-20 overflow-hidden">
                                <MathRenderer
                                  content={formatContent(
                                    exercise.solution_data
                                  )}
                                />
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
                                {[...Array(3 - exercise.difficulty)].map(
                                  (_, i) => (
                                    <span
                                      key={i}
                                      className="h-2 w-2 rounded-full bg-muted"
                                    />
                                  )
                                )}
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
                      ))}
                    </div>
                  )}
                </div>
              ))
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

        {activeTab === "simulations" && (
          <div>
            {localFlaggedSimulations.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Simulazioni preferite
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localFlaggedSimulations.map((simulation) => (
                    <Link
                      href={`/dashboard/simulazioni/${simulation.id}`}
                      key={simulation.id}
                    >
                      <Card className="h-full transform transition-all hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle>{simulation.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) =>
                                  handleUnflagSimulation(simulation.id, e)
                                }
                                className="focus:outline-none"
                                aria-label="Rimuovi dai preferiti"
                              >
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 hover:text-yellow-500" />
                              </button>
                              {simulation.is_completed && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completata
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <School className="h-4 w-4 mr-1" />
                            {simulation.subject}
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            {simulation.year}
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTimeInHours(simulation.time_in_min)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {simulation.description.length > 120
                              ? `${simulation.description.substring(0, 120)}...`
                              : simulation.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge
                              variant={
                                simulation.is_complete ? "default" : "outline"
                              }
                              className="px-2 py-1"
                            >
                              {simulation.is_complete ? "Completa" : "Parziale"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              {simulation.is_completed
                                ? "Rivedi Simulazione"
                                : simulation.is_started
                                ? "Continua Simulazione"
                                : "Inizia Simulazione"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground text-lg">
                  Non hai ancora aggiunto simulazioni ai preferiti.
                </p>
                <p className="text-muted-foreground mt-2">
                  Aggiungi le simulazioni che ti interessano usando l'icona
                  della stellina.
                </p>
                <Link
                  href="/dashboard/simulazioni"
                  className="mt-4 inline-block"
                >
                  <Button>Vai alle Simulazioni</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
