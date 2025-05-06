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
  flaggedExercises: FlaggedExercise[];
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

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Flag className="h-5 w-5 text-amber-500 mr-2" />
          <CardTitle className="text-xl">Esercizi segnati</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {flaggedExercises.length > 0 ? (
          <ul className="space-y-2">
            {flaggedExercises.map((exercise) => (
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
