import { Suspense } from "react";
import { getDashboardData } from "./dashboard-data-server";
import { DashboardStats } from "@/app/components/dashboard/dashboard-stats-client";
import { DashboardActions } from "@/app/components/dashboard/action-buttons-client";
import { FlaggedExercises } from "@/app/components/dashboard/flagged-exercises-client";
import { PageLoadingSkeleton } from "@/app/components/dashboard/page-loading-server";

export default async function DashboardIndexPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const dashboardData = await getDashboardData();
  const { userData, completionData, randomQuote, continueUrl } = dashboardData;

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
      <FlaggedExercises flaggedExercises={userData.flaggedExercises} />
    </div>
  );
}
