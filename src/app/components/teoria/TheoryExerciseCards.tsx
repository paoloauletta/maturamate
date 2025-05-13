"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseCard from "@/app/components/shared/exercises/ExerciseCard";
import {
  SubtopicWithTheoryType,
  TopicType,
  ExerciseCardType,
} from "@/types/theoryTypes";

interface TheoryExerciseCardsProps {
  topic: TopicType;
  subtopic: SubtopicWithTheoryType;
}

export default function TheoryExerciseCards({
  topic,
  subtopic,
}: TheoryExerciseCardsProps) {
  if (subtopic.exercise_cards.length === 0) {
    return null;
  }

  // Ensure we have proper typing, treating exercise_cards as ExerciseCardType[]
  const exerciseCards = subtopic.exercise_cards as ExerciseCardType[];

  return (
    <div className="border-t pt-8">
      <div className="relative overflow-hidden rounded-lg p-1">
        {/* Card carousel showing partial next card based on screen size */}
        <div className="flex space-x-4 pr-3 w-full overflow-x-visible">
          {/* First card (always visible on all screens) */}
          <div className="w-full min-w-full md:min-w-[calc(50%-8px)] md:w-[calc(50%-8px)] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
            <ExerciseCard
              id={exerciseCards[0].id}
              topicName={topic.name}
              topicOrder={topic.order_index}
              subtopicName={subtopic.name}
              subtopicOrder={subtopic.order_index}
              description={exerciseCards[0].description}
              difficulty={exerciseCards[0].difficulty}
              isCompleted={exerciseCards[0].is_completed}
              totalExercises={exerciseCards[0].total_exercises}
              completedExercises={exerciseCards[0].completed_exercises}
              isFlagged={exerciseCards[0].is_flagged}
            />
          </div>

          {/* Second card (glimpse on mobile, full on tablet/desktop) */}
          {exerciseCards.length > 1 && (
            <div className="min-w-[30%] w-[30%] md:min-w-[calc(50%-8px)] md:w-[calc(50%-8px)] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
              <ExerciseCard
                id={exerciseCards[1].id}
                topicName={topic.name}
                topicOrder={topic.order_index}
                subtopicName={subtopic.name}
                subtopicOrder={subtopic.order_index}
                description={exerciseCards[1].description}
                difficulty={exerciseCards[1].difficulty}
                isCompleted={exerciseCards[1].is_completed}
                totalExercises={exerciseCards[1].total_exercises}
                completedExercises={exerciseCards[1].completed_exercises}
                isFlagged={exerciseCards[1].is_flagged}
              />
            </div>
          )}

          {/* Third card (only visible on tablet+ with glimpse on tablet, full on desktop) */}
          {exerciseCards.length > 2 && (
            <div className="hidden md:block md:min-w-[30%] md:w-[30%] lg:min-w-[calc(33.333%-10.667px)] lg:w-[calc(33.333%-10.667px)]">
              <ExerciseCard
                id={exerciseCards[2].id}
                topicName={topic.name}
                topicOrder={topic.order_index}
                subtopicName={subtopic.name}
                subtopicOrder={subtopic.order_index}
                description={exerciseCards[2].description}
                difficulty={exerciseCards[2].difficulty}
                isCompleted={exerciseCards[2].is_completed}
                totalExercises={exerciseCards[2].total_exercises}
                completedExercises={exerciseCards[2].completed_exercises}
                isFlagged={exerciseCards[2].is_flagged}
              />
            </div>
          )}

          {/* Fourth card (only glimpse on desktop) */}
          {exerciseCards.length > 3 && (
            <div className="hidden lg:block lg:min-w-[25%] lg:w-[25%]">
              <ExerciseCard
                id={exerciseCards[3].id}
                topicName={topic.name}
                topicOrder={topic.order_index}
                subtopicName={subtopic.name}
                subtopicOrder={subtopic.order_index}
                description={exerciseCards[3].description}
                difficulty={exerciseCards[3].difficulty}
                isCompleted={exerciseCards[3].is_completed}
                totalExercises={exerciseCards[3].total_exercises}
                completedExercises={exerciseCards[3].completed_exercises}
                isFlagged={exerciseCards[3].is_flagged}
              />
            </div>
          )}
        </div>

        {/* Gradient overlay based on number of cards - responsive with CSS */}
        {exerciseCards.length > 1 && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pointer-events-none">
            {/* Main gradient overlay - light and dark mode compatible */}
            <div className="absolute inset-y-0 right-0 w-[100px] md:w-[120px] lg:w-[160px]">
              {/* Light mode gradient */}
              <div
                className="absolute inset-0 dark:hidden"
                style={{
                  background: `linear-gradient(90deg,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.7) 50%,
                    rgba(255, 255, 255, 0.95) 100%)`,
                }}
              />
              {/* Dark mode gradient */}
              <div
                className="absolute inset-0 hidden dark:block"
                style={{
                  background: `linear-gradient(90deg,
                    rgba(27, 27, 27, 0) 0%,
                    rgba(27, 27, 27, 0.7) 50%,
                    rgba(27, 27, 27, 0.95) 100%)`,
                }}
              />
            </div>

            {/* Counter badge as clickable link - Responsive for different screen sizes */}
            <Link
              href={`/dashboard/esercizi?subtopic=${subtopic.id}`}
              className="relative z-10 mr-4 md:mr-6 lg:mr-8 bg-muted/80 hover:bg-muted rounded-full py-2 px-3 px-4 backdrop-blur-sm border border-border cursor-pointer transition-colors duration-200 pointer-events-auto"
            >
              <span className="text-xs md:text-sm font-medium flex items-center">
                {/* Mobile */}
                <span className="md:hidden">
                  +{subtopic.exercise_cards.length - 1}
                </span>
                {/* Tablet */}
                <span className="hidden md:inline lg:hidden">
                  +{subtopic.exercise_cards.length - 2}
                </span>
                {/* Desktop */}
                <span className="hidden lg:inline">
                  +{subtopic.exercise_cards.length - 3}
                </span>
                <span className="ml-1">altri</span>
                <ChevronRight className="ml-1 h-3 w-3 opacity-70" />
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Exercise Button */}
      <div className="flex justify-start mt-4 lg:mt-8 p-1">
        <Link href={`/dashboard/esercizi?subtopic=${subtopic.id}`}>
          <Button
            className="group px-8 text-white cursor-pointer"
            variant="default"
            size="lg"
          >
            <span>Esercitati su questo argomento</span>
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
