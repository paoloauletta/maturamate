"use client";

import React from "react";
import ExerciseCard from "./ExerciseCard.client";
import { Star } from "lucide-react";

interface FavoriteExerciseCardProps {
  id: string;
  topicName: string;
  subtopicName: string;
  description: string;
  difficulty: number;
  isCompleted: boolean;
  totalExercises?: number;
  completedExercises?: number;
  onUnflag: (cardId: string, e: React.MouseEvent) => Promise<void>;
}

export default function FavoriteExerciseCard({
  id,
  topicName,
  subtopicName,
  description,
  difficulty,
  isCompleted,
  totalExercises,
  completedExercises,
  onUnflag,
}: FavoriteExerciseCardProps) {
  return (
    <div className="relative h-full">
      {/* ExerciseCard with star disabled and custom link */}
      <ExerciseCard
        id={id}
        topicName={topicName}
        topicOrder={null}
        subtopicName={subtopicName}
        subtopicOrder={null}
        description={description}
        difficulty={difficulty}
        isCompleted={isCompleted}
        totalExercises={totalExercises}
        completedExercises={completedExercises}
        disableStar={true} // Disable the built-in star
        customLinkHref={`/dashboard/esercizi/card/${id}?from=preferiti`}
      />

      {/* Custom star button */}
      <div
        className="absolute top-4 right-4 z-10 rounded-full text-yellow-500 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUnflag(id, e);
        }}
        title="Rimuovi dai preferiti"
      >
        <Star className="h-4 w-4" fill="currentColor" />
      </div>
    </div>
  );
}
