import { Skeleton } from "@/components/ui/skeleton";

export function FavoritesSkeleton() {
  return (
    <div className="container">
      {/* Title and filter area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24 mt-4 md:mt-0" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="mb-8">
        {/* Topic headers */}
        <Skeleton className="h-6 w-64 mb-4" />

        {/* Cards grid skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
