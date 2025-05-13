import { Skeleton } from "@/components/ui/skeleton";

export function SimulationsSkeleton() {
  return (
    <div className="container py-8">
      {/* Years list skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, yearIdx) => (
          <div key={yearIdx}>
            <Skeleton className="h-8 w-32 mb-4" /> {/* Year title */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, cardIdx) => (
                <Skeleton key={cardIdx} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
