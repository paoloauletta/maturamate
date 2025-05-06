import { Skeleton } from "@/components/ui/skeleton";

export function StatisticsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <Skeleton className="h-9 w-64 mb-4" />
      </section>

      {/* Overall Performance Summary Skeleton */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card/50 rounded-lg border shadow-sm h-[130px]"
          >
            {/* Intentionally empty to only show card outline */}
          </div>
        ))}
      </section>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Topics Progress Skeleton */}
        <div className="bg-card/50 rounded-lg border shadow-sm">
          <div className="p-6 pb-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 pt-3">
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Weak Subtopics Skeleton */}
        <div className="bg-card/50 rounded-lg border shadow-sm">
          <div className="p-6 pb-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 pt-3">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Skeleton */}
      <div className="bg-card/50 rounded-lg border shadow-sm">
        <div className="p-6 pb-3">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 pt-3">
          {/* Simplified to a single block, as details are removed */}
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
