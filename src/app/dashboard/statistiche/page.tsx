import { Suspense } from "react";
import { StatisticsSkeleton } from "@/app/components/shared/loading";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { completedSimulationsTable, simulationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SimulationsStatisticsClient } from "./client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsSkeleton />}>
      <StatisticsContent />
    </Suspense>
  );
}

async function StatisticsContent() {
  try {
    // Get current user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch user's completed simulations
    const userCompletedSimulations =
      await db.query.completedSimulationsTable.findMany({
        where: eq(completedSimulationsTable.user_id, userId),
        orderBy: (simulations, { desc }) => [desc(simulations.created_at)],
      });

    // Get all available simulations
    const allSimulations = await db.query.simulationsTable.findMany();

    // Calculate statistics
    const completedSimulationIds = userCompletedSimulations.map(
      (sim) => sim.simulation_id
    );

    // Count unique completed simulations
    const uniqueCompletedSimulations = new Set(completedSimulationIds).size;

    // Total simulations count
    const totalSimulations = allSimulations.length;

    // Calculate completion percentage
    const completionPercentage =
      totalSimulations > 0
        ? Math.round((uniqueCompletedSimulations / totalSimulations) * 100)
        : 0;

    // Calculate time spent on simulations (in minutes)
    const totalTimeSpent = userCompletedSimulations.reduce((total, sim) => {
      // If the simulation has a completed_at time, calculate the duration
      if (sim.completed_at && sim.started_at) {
        const start = new Date(sim.started_at);
        const end = new Date(sim.completed_at);
        const durationInMinutes = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60)
        );
        return total + durationInMinutes;
      }
      return total;
    }, 0);

    // Get the monthly activity data (completed simulations by month)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString("it-IT", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        yearMonth: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`,
      };
    }).reverse();

    const monthlyActivity = last6Months.map((monthData) => {
      const simulationsInMonth = userCompletedSimulations.filter((sim) => {
        const simDate = new Date(sim.completed_at || sim.created_at);
        return (
          simDate.getMonth() === monthData.monthIndex &&
          simDate.getFullYear() === monthData.year
        );
      });

      return {
        month: monthData.month,
        year: monthData.year,
        count: simulationsInMonth.length,
        yearMonth: monthData.yearMonth,
      };
    });

    // Get recent simulations (last 5)
    const recentSimulations = await Promise.all(
      userCompletedSimulations.slice(0, 5).map(async (sim) => {
        const simulation = await db.query.simulationsTable.findFirst({
          where: sim.simulation_id
            ? eq(simulationsTable.id, sim.simulation_id)
            : undefined,
        });

        return {
          id: sim.id,
          title: simulation?.title || "Simulazione",
          date: new Date(sim.completed_at || sim.created_at).toLocaleDateString(
            "it-IT"
          ),
          attempt: sim.attempt,
          simulationId: sim.simulation_id,
        };
      })
    );

    // Prepare statistics data for the client component
    const statisticsData = {
      totalSimulations,
      completedSimulations: uniqueCompletedSimulations,
      completionPercentage,
      totalTimeSpent,
      monthlyActivity,
      recentSimulations,
    };

    return <SimulationsStatisticsClient data={statisticsData} />;
  } catch (error) {
    console.error("Error loading statistics:", error);
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Statistiche</h1>
        <p className="text-muted-foreground">
          Si è verificato un errore durante il caricamento delle statistiche.
        </p>
      </div>
    );
  }
}
