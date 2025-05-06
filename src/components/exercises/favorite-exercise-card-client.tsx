"use client";

import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface FavoriteExerciseCardProps {
  card: {
    id: string;
    topic_name: string | null;
    topic_id: string | null;
    subtopic_name: string | null;
    description: string;
    difficulty: number;
    is_completed?: boolean;
    total_exercises?: number;
    completed_exercises?: number;
  };
  onUnflag: (e: React.MouseEvent) => void;
}

export function FavoriteExerciseCard({
  card,
  onUnflag,
}: FavoriteExerciseCardProps) {
  const {
    id,
    topic_name,
    subtopic_name,
    description,
    difficulty,
    is_completed = false,
    total_exercises,
    completed_exercises,
  } = card;

  return (
    <Link
      href={`/dashboard/esercizi/card/${id}?from=preferiti`}
      className="block h-full"
    >
      <Card className="relative h-full hover:-md transition- cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {topic_name && (
                  <Badge variant="secondary" className="font-normal">
                    {topic_name}
                  </Badge>
                )}
                {subtopic_name && (
                  <Badge variant="outline" className="font-normal">
                    {subtopic_name}
                  </Badge>
                )}
                <Badge
                  className={cn(
                    "font-normal",
                    difficulty === 1 && "bg-green-500 hover:bg-green-600",
                    difficulty === 2 && "bg-yellow-500 hover:bg-yellow-600",
                    difficulty === 3 && "bg-red-500 hover:bg-red-600"
                  )}
                >
                  Difficoltà: {difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg font-medium">
                {description}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {total_exercises && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso:</span>
                <span>
                  {completed_exercises}/{total_exercises} completati
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    is_completed ? "bg-green-500" : "bg-primary"
                  )}
                  style={{
                    width: `${
                      total_exercises
                        ? ((completed_exercises || 0) / total_exercises) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Custom star button */}
        <div
          className="absolute top-4 right-4 z-10 rounded-full text-yellow-500 cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={onUnflag}
          title="Rimuovi dai preferiti"
        >
          <Star className="h-5 w-5" fill="currentColor" />
        </div>
      </Card>
    </Link>
  );
}
