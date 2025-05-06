import { Skeleton } from "@/components/ui/skeleton";

export function ExercisesMobileLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Mobile Topic Dropdown Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      {/* Exercise List Skeleton */}
      <div className="rounded-md border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-border last:border-0 h-[120px] bg-card/50"
          >
            {/* Intentionally empty to only show item outline */}
          </div>
        ))}
      </div>
    </div>
  );
}
