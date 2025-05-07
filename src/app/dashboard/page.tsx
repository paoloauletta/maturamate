import { Suspense } from "react";
import { getDashboardData } from "@/app/dashboard/data/dashboard-data-server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats-client";
import { DashboardActions } from "@/components/dashboard/action-buttons-client";
import { FlaggedExercises } from "@/components/dashboard/flagged-exercises-client";
import { DashboardSkeleton } from "@/components/loading";

// Set revalidation period - revalidate every 10 minutes to keep dashboard data fresh
export const revalidate = 600;

export default async function DashboardIndexPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  try {
    const dashboardData = await getDashboardData();
    const { userData, completionData, randomQuote, continueUrl } =
      dashboardData;

    // Extract flagged exercises items with proper fallback
    const flaggedItems = userData.flaggedExercises || [];

    return (
      <div className="flex flex-col gap-6">
        {/* Welcome Header */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Ciao, {userData.name}!
          </h1>
          <p className="text-muted-foreground">{randomQuote}</p>
          <div className="flex items-center text-amber-500 font-semibold mt-2">
            <span>Mancano {userData.daysToExam} giorni alla maturità!</span>
          </div>
        </section>

        {/* Stats Cards - Client Component */}
        <DashboardStats data={dashboardData} />

        {/* Action Cards - Client Component */}
        <DashboardActions
          continueUrl={continueUrl}
          weakestTopic={userData.weakestTopic}
        />

        {/* Flagged Exercises - Client Component */}
        <FlaggedExercises flaggedExercises={flaggedItems} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Si è verificato un errore durante il caricamento della dashboard.
        </p>
      </div>
    );
  }
}
