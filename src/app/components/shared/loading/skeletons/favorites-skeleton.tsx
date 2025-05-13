import { Skeleton } from "@/components/ui/skeleton";

export function FavoritesSkeleton() {
  return (
    <div className="container py-8">
      {/* Tabs skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      {/* Cards grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      {/* Exercises list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
