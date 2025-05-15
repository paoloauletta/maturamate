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
  CardTitle,
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
  BookCopy,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import MathRenderer from "@/app/components/shared/renderer/math-renderer";
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
import { motion, AnimatePresence } from "framer-motion";

// Import the existing components
import MobileExerciseItem from "@/app/components/shared/exercises/MobileExerciseCard";
import { Exercise } from "@/app/components/shared/exercises/Exercise";
import ExerciseCard from "@/app/components/shared/exercises/ExerciseCard";
import SimulationItem from "@/app/components/simulations/card-item";
import { UserSimulation } from "@/types/simulationsTypes";

// Dynamically import MobileExerciseView to reduce initial bundle size
const MobileExercise = dynamic(
  () =>
    import("@/app/components/shared/exercises/MobileExercise").then(
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
  isCompleted: boolean;
  wasCorrect: boolean;
}

export interface FlaggedSimulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  time_in_min: number;
  is_complete: boolean;
  card_id: string;
  card_title: string;
  year: number;
  subject: string;
  created_at: string | Date;
  is_completed: boolean;
  is_started: boolean;
  is_flagged: boolean;
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
  const [activeTab, setActiveTab] = useState("cards");
  const [localFlaggedCards, setLocalFlaggedCards] =
    useState<FlaggedCard[]>(flaggedCards);
  const [localFlaggedExercises, setLocalFlaggedExercises] =
    useState<FlaggedExercise[]>(flaggedExercises);
  const [localFlaggedSimulations, setLocalFlaggedSimulations] =
    useState<FlaggedSimulation[]>(flaggedSimulations);

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  // State to track expanded simulation cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );

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

  // Handle unflagging a simulation
  const handleUnflagSimulation = async (
    simulationId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault(); // Prevent navigation when clicking the star
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
        // Remove from local state
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

  // Group simulations by year
  const simulationsByYear: Record<number, FlaggedSimulation[]> = {};
  localFlaggedSimulations.forEach((simulation) => {
    const year = simulation.year;
    if (!simulationsByYear[year]) {
      simulationsByYear[year] = [];
    }
    simulationsByYear[year].push(simulation);
  });

  // Get unique subjects from simulations
  const uniqueSubjects = Array.from(
    new Set(localFlaggedSimulations.map((sim) => sim.subject))
  ).sort();

  // Get unique years from simulations
  const uniqueYears = Array.from(
    new Set(localFlaggedSimulations.map((sim) => sim.year))
  ).sort((a, b) => b - a); // Sort in descending order (most recent first)

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
    } else if (type === "year") {
      setYearFilter(value === yearFilter ? null : (value as number));
    } else if (type === "subject") {
      setSubjectFilter(value === subjectFilter ? null : (value as string));
    }
  };

  const clearFilters = () => {
    setDifficultyFilter(null);
    setCompletionFilter(null);
    setYearFilter(null);
    setSubjectFilter(null);
  };

  // Convert minutes to a readable time format
  const formatTimeInMinutes = (minutes: number): string => {
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
            <h3 className="text-xl font-semibold mb-4 text-foreground/95 border-b border-muted pb-2">
              {topicName}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTopicExercises.map((exercise, index) => (
                <Link
                  key={exercise.id}
                  href={`/dashboard/esercizi/card/${exercise.exercise_card_id}?exerciseId=${exercise.id}`}
                  className="group"
                >
                  <Card className="mb-6 transition-all duration-300 hover:ring-primary/50 hover:ring-1 group-hover:bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">Es {index + 1}.</div>
                        <div className="flex items-center gap-2">
                          {exercise.isCompleted && exercise.wasCorrect && (
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Completato
                            </div>
                          )}
                          <Star
                            className="h-5 w-5 text-yellow-500"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Question */}
                      <div className="mb-4">
                        {formatContent(exercise.question_data)
                          .split("\n")
                          .map((line, i) => (
                            <div
                              key={`question-${exercise.id}-${i}`}
                              className="mb-2"
                            >
                              <MathRenderer content={line} />
                            </div>
                          ))}
                      </div>

                      {/* Solution section */}
                      <div className="rounded-md overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 flex items-center text-blue-700 dark:text-blue-300 font-medium text-sm">
                          Soluzione
                        </div>

                        <div
                          className={cn(
                            "bg-slate-50 dark:bg-slate-900/30 p-3",
                            !(exercise.isCompleted && exercise.wasCorrect) &&
                              "relative"
                          )}
                        >
                          {/* Solution content with conditional blur */}
                          <div
                            className={cn(
                              !(exercise.isCompleted && exercise.wasCorrect) &&
                                "blur-[4px]"
                            )}
                          >
                            {formatContent(exercise.solution_data)
                              .split("\n")
                              .map((line, i) => (
                                <div
                                  key={`solution-${exercise.id}-${i}`}
                                  className="mb-2"
                                >
                                  <MathRenderer content={line} />
                                </div>
                              ))}
                          </div>

                          {/* Only show a message if not completed */}
                          {!(exercise.isCompleted && exercise.wasCorrect) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80">
                              <p className="text-sm px-4 text-muted-foreground">
                                Completa l'esercizio per vedere la soluzione
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
            <Link
              key={exercise.id}
              href={`/dashboard/esercizi/card/${exercise.exercise_card_id}?exerciseId=${exercise.id}`}
              className="block mb-4"
            >
              <Card className="overflow-hidden transition-all duration-300 hover:ring-primary/50 hover:ring-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">Es {index + 1}.</div>
                    <div className="flex items-center gap-2">
                      {exercise.isCompleted && exercise.wasCorrect && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completato
                        </div>
                      )}
                      <Star
                        className="h-5 w-5 text-yellow-500"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Question */}
                  <div className="mb-4">
                    <MathRenderer
                      content={
                        formatContent(exercise.question_data).split("\n")[0] ||
                        ""
                      }
                    />
                  </div>

                  {/* Solution section */}
                  <div className="rounded-md overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2 flex items-center text-blue-700 dark:text-blue-300 font-medium text-xs">
                      Soluzione
                    </div>

                    <div
                      className={cn(
                        "bg-slate-50 dark:bg-slate-900/30 p-2",
                        !(exercise.isCompleted && exercise.wasCorrect) &&
                          "relative"
                      )}
                    >
                      {/* Solution preview with conditional blur */}
                      <div
                        className={cn(
                          "line-clamp-1",
                          !(exercise.isCompleted && exercise.wasCorrect) &&
                            "blur-[4px]"
                        )}
                      >
                        <MathRenderer
                          content={
                            formatContent(exercise.solution_data).split(
                              "\n"
                            )[0] || ""
                          }
                        />
                      </div>

                      {/* Only show a message if not completed */}
                      {!(exercise.isCompleted && exercise.wasCorrect) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80">
                          <p className="text-xs px-4 text-muted-foreground">
                            Completa l'esercizio
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      );
    }
  };

  // Build grouped simulations data for the tabs
  const getFilteredAndGroupedSimulations = () => {
    // Apply filters
    const filteredSimulations = localFlaggedSimulations.filter((simulation) => {
      // Apply year filter if selected
      if (yearFilter !== null && simulation.year !== yearFilter) {
        return false;
      }
      // Apply subject filter if selected
      if (subjectFilter !== null && simulation.subject !== subjectFilter) {
        return false;
      }
      // Apply completion filter if selected
      if (completionFilter === "completed" && !simulation.is_completed) {
        return false;
      }
      if (completionFilter === "incomplete" && simulation.is_completed) {
        return false;
      }
      return true;
    });

    // Group by year, then by card title
    const simulationsByYearAndCard: Record<
      number,
      Record<string, FlaggedSimulation[]>
    > = {};

    filteredSimulations.forEach((simulation) => {
      const year = simulation.year;
      const cardTitle = simulation.card_title;

      // Initialize year if needed
      if (!simulationsByYearAndCard[year]) {
        simulationsByYearAndCard[year] = {};
      }

      // Initialize card group if needed
      if (!simulationsByYearAndCard[year][cardTitle]) {
        simulationsByYearAndCard[year][cardTitle] = [];
      }

      // Add simulation to its group
      simulationsByYearAndCard[year][cardTitle].push(simulation);
    });

    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(simulationsByYearAndCard)
      .map(Number)
      .sort((a, b) => b - a);

    return { filteredSimulations, simulationsByYearAndCard, sortedYears };
  };

  // Initialize expanded cards state when simulations change
  useEffect(() => {
    const { simulationsByYearAndCard, sortedYears } =
      getFilteredAndGroupedSimulations();

    // Create a new object to track all cards, defaulting to expanded (true)
    const newExpandedCards: Record<string, boolean> = {};

    sortedYears.forEach((year) => {
      Object.keys(simulationsByYearAndCard[year]).forEach((cardTitle) => {
        const cardKey = `${year}-${cardTitle}`;
        // Only set if not already in state (to preserve user selections)
        if (expandedCards[cardKey] === undefined) {
          newExpandedCards[cardKey] = true; // Default to expanded
        }
      });
    });

    // Only update if we have new cards
    if (Object.keys(newExpandedCards).length > 0) {
      setExpandedCards((prev) => ({
        ...prev,
        ...newExpandedCards,
      }));
    }
  }, [localFlaggedSimulations, yearFilter, subjectFilter, completionFilter]);

  // Filter and render the simulations
  const renderSimulations = () => {
    if (localFlaggedSimulations.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            <BookCopy className="h-12 w-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium mb-2">
              Nessuna simulazione preferita
            </h3>
            <p>
              Aggiungi simulazioni ai preferiti facendo clic sull'icona a forma
              di stella.
            </p>
            <Link href="/dashboard/simulazioni" passHref>
              <Button className="mt-4">Esplora simulazioni</Button>
            </Link>
          </div>
        </div>
      );
    }

    // Apply filters
    const filteredSimulations = localFlaggedSimulations.filter((simulation) => {
      // Apply year filter if selected
      if (yearFilter !== null && simulation.year !== yearFilter) {
        return false;
      }
      // Apply subject filter if selected
      if (subjectFilter !== null && simulation.subject !== subjectFilter) {
        return false;
      }
      // Apply completion filter if selected
      if (completionFilter === "completed" && !simulation.is_completed) {
        return false;
      }
      if (completionFilter === "incomplete" && simulation.is_completed) {
        return false;
      }
      return true;
    });

    if (filteredSimulations.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium mb-2">
              Nessuna simulazione corrisponde ai filtri selezionati
            </h3>
            <p className="mb-6">
              Prova a modificare i filtri per visualizzare le tue simulazioni
              preferite.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Rimuovi filtri
            </Button>
          </div>
        </div>
      );
    }

    // Group by year, then by card title
    const simulationsByYearAndCard: Record<
      number,
      Record<string, FlaggedSimulation[]>
    > = {};

    filteredSimulations.forEach((simulation) => {
      const year = simulation.year;
      const cardTitle = simulation.card_title;

      // Initialize year if needed
      if (!simulationsByYearAndCard[year]) {
        simulationsByYearAndCard[year] = {};
      }

      // Initialize card group if needed
      if (!simulationsByYearAndCard[year][cardTitle]) {
        simulationsByYearAndCard[year][cardTitle] = [];
      }

      // Add simulation to its group
      simulationsByYearAndCard[year][cardTitle].push(simulation);
    });

    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(simulationsByYearAndCard)
      .map(Number)
      .sort((a, b) => b - a);

    // Animation variants for expand/collapse
    const expandVariants = {
      hidden: { opacity: 0, height: 0 },
      visible: {
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.3,
        },
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          duration: 0.2,
        },
      },
    };

    // Toggle card expanded state
    const toggleCardExpanded = (cardKey: string) => {
      setExpandedCards((prev) => ({
        ...prev,
        [cardKey]: !prev[cardKey],
      }));
    };

    return (
      <div className="space-y-12">
        {sortedYears.map((year) => (
          <div key={year} className="space-y-6">
            <h2 className="text-2xl font-semibold">Simulazioni {year}</h2>

            <div className="space-y-4">
              {Object.entries(simulationsByYearAndCard[year]).map(
                ([cardTitle, simulations]) => {
                  // Get subject from first simulation
                  const subject = simulations[0].subject;
                  const description = simulations[0].description;

                  // Generate a unique key for this card
                  const cardKey = `${year}-${cardTitle}`;
                  // Get expanded state for this card (default to true if not set)
                  const isExpanded = expandedCards[cardKey] !== false;

                  return (
                    <motion.div
                      key={cardKey}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.15,
                          ease: "easeOut",
                        },
                      }}
                    >
                      <Card className="border border-border/80 dark:border-border bg-background overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl">
                              {cardTitle}
                            </CardTitle>
                            <button
                              onClick={() => toggleCardExpanded(cardKey)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={
                                isExpanded
                                  ? "Nascondi simulazioni"
                                  : "Mostra simulazioni"
                              }
                            >
                              <motion.svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </motion.svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <span>{subject}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <div className="flex items-center">
                              <span>{year}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-sm text-muted-foreground">
                            {description.length > 120
                              ? `${description.substring(0, 120)}...`
                              : description}
                          </p>
                        </CardContent>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={expandVariants}
                              className="px-6 space-y-2"
                            >
                              {simulations.map((simulation, index) => (
                                <SimulationItem
                                  key={simulation.id}
                                  simulation={{
                                    ...simulation,
                                    is_flagged: true, // Always true in favorites page
                                  }}
                                  index={index}
                                  onToggleFavorite={handleUnflagSimulation}
                                  formatTimeInHours={formatTimeInMinutes}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
          <h3 className="text-xl font-semibold mb-4 text-foreground/95 border-b border-muted pb-2">
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

    // Desktop view
    return Object.entries(filteredCardsByTopic).map(([topicId, cards]) => (
      <div key={topicId} className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-foreground/95 border-b border-muted pb-2">
          {cards[0]?.topic_name || "Altro"}
        </h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ExerciseCard
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
              isFlagged={true}
              customLinkHref={`/dashboard/esercizi/card/${card.id}?from=preferiti`}
            />
          ))}
        </div>
      </div>
    ));
  };

  // Get the appropriate filter dropdown based on the active tab
  const renderFilterDropdown = () => {
    // Common difficulty filter for exercises and cards
    const difficultyItems = (
      <>
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
      </>
    );

    // Completion filter for cards and simulations
    const completionItems = (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Stato completamento</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleFilterChange("completion", "completed")}
            className={cn(completionFilter === "completed" && "bg-muted")}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completati</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleFilterChange("completion", "incomplete")}
            className={cn(completionFilter === "incomplete" && "bg-muted")}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Non completati</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </>
    );

    // Year and subject filters for simulations
    const simulationFilters = (
      <>
        {uniqueYears.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Anno</DropdownMenuLabel>
            <DropdownMenuGroup>
              {uniqueYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => handleFilterChange("year", year)}
                  className={cn(yearFilter === year && "bg-muted")}
                >
                  <div className="flex items-center gap-2">
                    <span>{year}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        {uniqueSubjects.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Materia</DropdownMenuLabel>
            <DropdownMenuGroup>
              {uniqueSubjects.map((subject) => (
                <DropdownMenuItem
                  key={subject}
                  onClick={() => handleFilterChange("subject", subject)}
                  className={cn(subjectFilter === subject && "bg-muted")}
                >
                  <div className="flex items-center gap-2">
                    <span>{subject}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </>
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filtra</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {activeTab === "cards" && difficultyItems}
          {activeTab === "exercises" && difficultyItems}
          {(activeTab === "cards" || activeTab === "simulations") &&
            completionItems}
          {activeTab === "simulations" && simulationFilters}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearFilters}>
            Rimuovi filtri
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            I tuoi preferiti
          </h1>
          <p className="text-muted-foreground">
            Gli elementi che hai salvato tra i preferiti
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="mt-4 md:mt-0">{renderFilterDropdown()}</div>
      </div>

      {/* Tab buttons */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <Button
          variant={activeTab === "cards" ? "default" : "outline"}
          onClick={() => setActiveTab("cards")}
          className="flex-1 md:flex-none"
        >
          <BookText className="h-4 w-4 mr-2" />
          Schede
        </Button>
        <Button
          variant={activeTab === "exercises" ? "default" : "outline"}
          onClick={() => setActiveTab("exercises")}
          className="flex-1 md:flex-none"
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Esercizi singoli
        </Button>
        <Button
          variant={activeTab === "simulations" ? "default" : "outline"}
          onClick={() => setActiveTab("simulations")}
          className="flex-1 md:flex-none"
        >
          <BookCopy className="h-4 w-4 mr-2" />
          Simulazioni
        </Button>
      </div>

      {/* Content based on active tab */}
      <div className="mb-8">
        {activeTab === "cards"
          ? renderCards()
          : activeTab === "exercises"
          ? renderExercises()
          : renderSimulations()}
      </div>
    </div>
  );
}
