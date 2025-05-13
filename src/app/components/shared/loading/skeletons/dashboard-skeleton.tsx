import { Skeleton } from "@/components/ui/skeleton";
import { BaseCardSkeleton } from "./base-card-skeleton";
import { BaseListSkeleton } from "./base-list-skeleton";
import { HeaderSkeleton } from "./header-skeleton";

/**
 * Skeleton for the dashboard welcome section
 */
function WelcomeSection() {
  return (
    <section className="space-y-2">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-56 mt-2" />
    </section>
  );
}

/**
 * Skeleton for the dashboard stats cards section
 */
function StatsSection() {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <BaseCardSkeleton key={i} height="h-[130px]" />
      ))}
    </section>
  );
}

/**
 * Skeleton for the dashboard action cards section
 */
function ActionCardsSection() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <BaseCardSkeleton key={i} height="h-[210px]" />
      ))}
    </section>
  );
}

/**
 * Skeleton for the flagged exercises section
 */
function FlaggedExercisesSection() {
  return (
    <div className="bg-card/50 rounded-lg border -sm mt-6">
      <div className="p-6 pb-3">
        <div className="flex items-center">
          <Skeleton className="h-5 w-5 mr-2" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
      <div className="p-6 pt-3">
        <BaseListSkeleton
          count={3}
          itemHeight="h-6"
          withBorder={false}
          withBackground={false}
        />
      </div>
    </div>
  );
}

/**
 * Complete dashboard page skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeSection />
      <StatsSection />
      <ActionCardsSection />
      <FlaggedExercisesSection />
    </div>
  );
}
