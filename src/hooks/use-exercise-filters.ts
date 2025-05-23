"use client";

import { useState } from "react";

// Define FilterState interface locally
export interface FilterState {
  difficultyFilter: number | null;
  completionFilter: string | null;
}

export function useExerciseFilters() {
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<string | null>(null);

  const handleFilterChange = (
    type: "difficulty" | "completion",
    value: number | string
  ) => {
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

  const filterState: FilterState = {
    difficultyFilter,
    completionFilter,
  };

  const activeFilterCount =
    (difficultyFilter !== null ? 1 : 0) + (completionFilter !== null ? 1 : 0);

  /**
   * Filter function for exercise cards
   */
  const filterCard = (card: {
    difficulty: number;
    is_completed: boolean;
  }): boolean => {
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
  };

  return {
    filterState,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    filterCard,
  };
}
