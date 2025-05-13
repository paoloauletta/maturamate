import { Suspense } from "react";
import { DashboardSkeleton } from "@/app/components/shared/loading";
import { DashboardStats } from "@/app/components/dashboard/dashboard-stats-client";
import { DashboardActions } from "@/app/components/dashboard/action-buttons-client";
import { FlaggedExercises } from "@/app/components/dashboard/flagged-exercises-client";

// Force dynamic rendering since this page uses headers() indirectly through auth()
export const dynamic = "force-dynamic";

// Set revalidation period - revalidate every 10 minutes to keep dashboard data fresh
export const revalidate = 600;

// Mock data for the dashboard
const mockDashboardData = {
  userData: {
    name: "Studente",
    overallProgress: 65,
    uniqueCompletedExercises: 78,
    totalAvailableExercises: 120,
    totalExercises: 85,
    correctExercises: 70,
    incorrectExercises: 15,
    simulationsCompleted: 3,
    daysToExam: 42,
    weakestTopic: "Analisi Matematica",
    flaggedExercises: [
      {
        id: "ex1",
        title: "Derivate di funzioni composte",
        path: "/dashboard/esercizi/matematica",
      },
      {
        id: "ex2",
        title: "Integrali definiti",
        path: "/dashboard/esercizi/matematica",
      },
    ],
  },
  completionData: {
    topicsCompletionPercentage: 58,
    completedTopics: 7,
    totalTopics: 12,
  },
  randomQuote: "La matematica è la ginnastica dell'intelligenza.",
  continueUrl: "/dashboard/teoria/matematica",
};

export default async function DashboardIndexPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  try {
    // Use mock data instead of fetching
    const dashboardData = mockDashboardData;
    const { userData, randomQuote, continueUrl } = dashboardData;

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
