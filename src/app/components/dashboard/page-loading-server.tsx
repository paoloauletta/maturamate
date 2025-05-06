import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header Skeleton */}
      <section className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-56 mt-2" />
      </section>

      {/* Stats Cards Skeleton */}
      <section className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card/50 rounded-lg border shadow-sm h-[130px]"
          >
            {/* Intentionally empty to only show card outline */}
          </div>
        ))}
      </section>

      {/* Action Cards Skeleton */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card/50 rounded-lg border shadow-sm h-[210px]"
          >
            {/* Intentionally empty to only show card outline */}
          </div>
        ))}
      </section>

      {/* Flagged Exercises Skeleton */}
      <div className="bg-card/50 rounded-lg border shadow-sm mt-6">
        <div className="p-6 pb-3">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <div className="p-6 pt-3">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
