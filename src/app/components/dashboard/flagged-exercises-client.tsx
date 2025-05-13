"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type FlaggedExercise = {
  id: string;
  title: string;
  path: string;
};

interface FlaggedExercisesProps {
  flaggedExercises: FlaggedExercise[] | undefined | null;
}

export function FlaggedExercises({ flaggedExercises }: FlaggedExercisesProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Safe check for flaggedExercises
  const exercises = Array.isArray(flaggedExercises) ? flaggedExercises : [];

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Flag className="h-5 w-5 text-amber-500 mr-2" />
          <CardTitle className="text-xl">Esercizi segnati</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {exercises.length > 0 ? (
          <ul className="space-y-2">
            {exercises.map((exercise) => (
              <li key={exercise.id} className="border-b pb-2 last:border-0">
                <Link
                  href={exercise.path}
                  className="hover:text-primary transition-colors"
                >
                  {exercise.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Non hai ancora segnato alcun esercizio.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
