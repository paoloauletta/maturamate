"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, BookOpen, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface ExerciseCardProps {
  id: string;
  topicName: string;
  topicOrder: number | null;
  subtopicName: string;
  subtopicOrder: number | null;
  description: string;
  difficulty: number;
  isCompleted: boolean;
  totalExercises?: number;
  completedExercises?: number;
  disableStar?: boolean;
  disableHeader?: boolean;
  customLinkHref?: string;
}

export default function ExerciseCard({
  id,
  topicName,
  topicOrder,
  subtopicName,
  subtopicOrder,
  description,
  difficulty,
  isCompleted,
  totalExercises = 0,
  completedExercises = 0,
  disableStar = false,
  disableHeader = false,
  customLinkHref,
}: ExerciseCardProps) {
  const [isFlagged, setIsFlagged] = useState(false);

  // Check if this card is flagged when component mounts
  useEffect(() => {
    if (disableStar) return;

    const checkIfCardFlagged = async () => {
      try {
        const response = await fetch(`/api/exercises/flag-card?cardId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFlagged(data.flagged);
        }
      } catch (error) {
        console.error("Error checking if card is flagged:", error);
      }
    };

    checkIfCardFlagged();
  }, [id, disableStar]);

  // Handle toggling the flag status
  const handleToggleFlag = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from being followed
    e.stopPropagation(); // Prevent event bubbling

    try {
      const response = await fetch("/api/exercises/flag-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFlagged(data.flagged);
      }
    } catch (error) {
      console.error("Error toggling card flag:", error);
    }
  };

  // Format the topic and subtopic with order numbers if available
  const formattedTopic =
    topicOrder !== null ? `${topicOrder}. ${topicName}` : topicName;
  const formattedSubtopic =
    subtopicOrder !== null ? `${subtopicOrder}. ${subtopicName}` : subtopicName;

  // Determine the link URL to use
  const linkHref = customLinkHref || `/dashboard/esercizi/card/${id}`;

  return (
    <Link href={linkHref}>
      <Card className="h-full transition-all duration-300 hover:bg-muted/50 flex flex-col relative">
        <CardHeader className="pb-2">
          {!disableHeader && (
            <div>
              <div className="flex w-full justify-between items-center mb-2">
                <div className="text-xs text-muted-foreground">
                  {formattedTopic} &gt; {formattedSubtopic}
                </div>

                {isFlagged && !disableStar && (
                  <div
                    className="rounded-full text-yellow-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={handleToggleFlag}
                    title="Rimuovi dai preferiti"
                    data-star-icon="true"
                  >
                    <Star className="h-4 w-4" fill="currentColor" />
                  </div>
                )}
              </div>
              <CardTitle className="text-base pr-6">
                <span className="line-clamp-2 overflow-hidden">
                  {description}
                </span>
              </CardTitle>
            </div>
          )}
          {disableHeader && (
            <div className="flex items-center gap-2">
              <CardTitle className="text-base pr-6">
                <span className="line-clamp-2 overflow-hidden">
                  {description}
                </span>
              </CardTitle>
              {isFlagged && !disableStar && (
                <div
                  className="rounded-full text-yellow-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={handleToggleFlag}
                  title="Rimuovi dai preferiti"
                  data-star-icon="true"
                >
                  <Star className="h-4 w-4" fill="currentColor" />
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          {/* Difficulty indicators */}
          <div className="flex gap-1 items-center">
            {[...Array(difficulty)].map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  difficulty === 1
                    ? "bg-green-500 dark:bg-green-400"
                    : difficulty === 2
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-red-500 dark:bg-red-400"
                }`}
              />
            ))}
            {[...Array(3 - difficulty)].map((_, i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-muted" />
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
          <div className="flex items-center gap-1">
            {isCompleted ? (
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
          {totalExercises > 0 && !isCompleted && (
            <div className="text-xs font-medium">
              {completedExercises}/{totalExercises}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
