"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { CheckCircle2, BookOpen } from "lucide-react";

interface ExerciseCompletionProps {
  exerciseId: string;
  initialIsCompleted?: boolean;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch completion status");
  return res.json();
};

export default function ExerciseCompletion({
  exerciseId,
  initialIsCompleted = false,
}: ExerciseCompletionProps) {
  // Use SWR for client-side caching with a long stale time
  const { data, error, isLoading, mutate } = useSWR(
    `/api/exercises/status/${exerciseId}`,
    fetcher,
    {
      fallbackData: { isCompleted: initialIsCompleted },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Only refetch after 1 minute
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // When isCompleted changes externally, update our cache
  useEffect(() => {
    if (initialIsCompleted !== data?.isCompleted) {
      mutate({ isCompleted: initialIsCompleted }, false);
    }
  }, [initialIsCompleted, data?.isCompleted, mutate]);

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-muted-foreground text-sm">
        <BookOpen className="h-3.5 w-3.5 inline mr-1" />
        <span>Status unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {data.isCompleted ? (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Completato</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Non completato</span>
        </div>
      )}
    </div>
  );
}
