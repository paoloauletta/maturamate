/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BookText,
  Filter,
  CheckCircle2,
  BookCopy,
  ClipboardCheck,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

// Import the existing components
import SimulationItem from "@/app/components/simulations/card-item";
import router from "next/router";

// Define more specific types for question and solution data
export interface ContentData {
  text?: string;
  html?: string;
  [key: string]: unknown; // Allow for other properties
}

// Type for content that can be either a string, an array of strings, or an object with specific properties
export type ContentType = string | string[] | ContentData;

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
  flaggedSimulations: FlaggedSimulation[];
}

export default function FavoritesClient({
  flaggedSimulations,
}: FavoritesClientProps) {
  const [activeTab, setActiveTab] = useState("cards");
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={expandVariants}
                              className="px-4 md:px-6 space-y-2"
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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            I tuoi preferiti
          </h1>
          <p className="text-muted-foreground">
            Gli elementi che hai salvato tra i preferiti
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="mt-4 md:mt-0">{renderFilterDropdown()}</div>
      </div>

      {/* Content based on active tab */}
      <div className="mb-8">{renderSimulations()}</div>
    </div>
  );
}
