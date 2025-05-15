"use client";

import { Progress } from "@/components/ui/progress";

interface ExerciseProgressProps {
  correctCount: number;
  totalExercises: number;
  label?: string;
  className?: string;
}

export default function ExerciseProgress({
  correctCount,
  totalExercises,
  label = "Progresso",
  className,
}: ExerciseProgressProps) {
  // Progress percentage based only on CORRECT exercises
  const progressPercentage =
    totalExercises > 0 ? (correctCount / totalExercises) * 100 : 0;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {correctCount}/{totalExercises} corretti
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
