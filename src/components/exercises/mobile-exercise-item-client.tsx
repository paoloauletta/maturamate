"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MathRenderer } from "@/components/renderer/math-renderer-client";
import { FlaggedExercise } from "@/components/dashboard/preferiti/favorites-client";

export interface MobileExerciseItemProps {
  exercise: FlaggedExercise;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUnflag: (e: React.MouseEvent) => void;
}

export function MobileExerciseItem({
  exercise,
  isExpanded,
  onToggleExpand,
  onUnflag,
}: MobileExerciseItemProps) {
  const {
    id,
    card_description,
    topic_name,
    subtopic_name,
    difficulty,
    question_data,
    solution_data,
    exercise_card_id,
  } = exercise;

  // Always expand in favorites by default
  useEffect(() => {
    if (!isExpanded) {
      onToggleExpand();
    }
  }, []);

  // Format content for display
  const formatContent = (data: any): string => {
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

  return (
    <div className="border p-4 rounded-lg bg-card">
      {/* Header with star and expand */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {topic_name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {topic_name}
              </span>
            )}
            {subtopic_name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
                {subtopic_name}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                difficulty === 1 && "bg-green-100 text-green-800",
                difficulty === 2 && "bg-yellow-100 text-yellow-800",
                difficulty === 3 && "bg-red-100 text-red-800"
              )}
            >
              Difficoltà: {difficulty}
            </span>
          </div>
          <h3 className="font-medium">{card_description}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-yellow-500"
            onClick={onUnflag}
            aria-label="Rimuovi dai preferiti"
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
          <button
            className="text-gray-500"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Chiudi" : "Espandi"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium mb-1 text-sm">Domanda:</h4>
            <div className="bg-muted p-3 rounded-md text-sm">
              <MathRenderer content={formatContent(question_data)} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1 text-sm">Soluzione:</h4>
            <div className="bg-muted p-3 rounded-md text-sm">
              <MathRenderer content={formatContent(solution_data)} />
            </div>
          </div>

          <div className="pt-2 text-right">
            <Link
              href={`/dashboard/esercizi/card/${exercise_card_id}`}
              className="text-primary text-sm hover:underline"
            >
              Vedi scheda completa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
