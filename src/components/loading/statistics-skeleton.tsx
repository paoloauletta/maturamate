import { Skeleton } from "@/components/ui/skeleton";
import { BaseCardSkeleton } from "./base-card-skeleton";
import { BaseListSkeleton } from "./base-list-skeleton";
import { HeaderSkeleton } from "./header-skeleton";

/**
 * Skeleton for the performance summary cards section
 */
function PerformanceSummarySkeleton() {
  return (
    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <BaseCardSkeleton key={i} height="h-[130px]" />
      ))}
    </section>
  );
}

/**
 * Skeleton for the topics progress section
 */
function TopicsProgressSkeleton() {
  return (
    <div className="bg-card/50 rounded-lg border shadow-sm">
      <div className="p-6 pb-3">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="p-6 pt-3">
        <BaseListSkeleton
          count={5}
          itemHeight="h-8"
          gap="gap-5"
          withBorder={false}
          withBackground={false}
        />
      </div>
    </div>
  );
}

/**
 * Skeleton for the weak subtopics section
 */
function WeakSubtopicsSkeleton() {
  return (
    <div className="bg-card/50 rounded-lg border shadow-sm">
      <div className="p-6 pb-3">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="p-6 pt-3">
        <BaseListSkeleton
          count={5}
          itemHeight="h-8"
          gap="gap-4"
          withBorder={false}
          withBackground={false}
        />
      </div>
    </div>
  );
}

/**
 * Skeleton for the weekly activity section
 */
function WeeklyActivitySkeleton() {
  return (
    <div className="bg-card/50 rounded-lg border shadow-sm">
      <div className="p-6 pb-3">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="p-6 pt-3">
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

/**
 * Complete statistics page skeleton
 */
export function StatisticsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <HeaderSkeleton titleWidth="w-64" />
      <PerformanceSummarySkeleton />

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <TopicsProgressSkeleton />
        <WeakSubtopicsSkeleton />
      </div>

      <WeeklyActivitySkeleton />
    </div>
  );
}
