"use client";

import { CheckCircle2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterState = {
  difficultyFilter: number | null;
  completionFilter: string | null;
};

interface DifficultyCompletionFilterProps {
  filters: FilterState;
  onFilterChange: (
    type: "difficulty" | "completion",
    value: number | string
  ) => void;
  onClearFilters: () => void;
}

export default function DifficultyCompletionFilter({
  filters,
  onFilterChange,
  onClearFilters,
}: DifficultyCompletionFilterProps) {
  const { difficultyFilter, completionFilter } = filters;

  // Calculate filter counts for badges
  const activeFilterCount =
    (difficultyFilter !== null ? 1 : 0) + (completionFilter !== null ? 1 : 0);

  return (
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
              onClick={() => onFilterChange("difficulty", level)}
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
            onClick={() => onFilterChange("completion", "completed")}
            className={cn(completionFilter === "completed" && "bg-muted")}
          >
            Completati
            {completionFilter === "completed" && (
              <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange("completion", "not_completed")}
            className={cn(completionFilter === "not_completed" && "bg-muted")}
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
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
          >
            Rimuovi filtri
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
