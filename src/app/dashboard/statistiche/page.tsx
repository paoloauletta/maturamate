import { Suspense } from "react";
import { getStatisticsData } from "./statistics-data-server";
import { StatisticsClient } from "./statistics-client";
import { StatisticsSkeleton } from "@/components/loading/statistics-skeleton";

// Set revalidation period - revalidate every hour
export const revalidate = 3600;

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsSkeleton />}>
      <StatisticsContent />
    </Suspense>
  );
}

async function StatisticsContent() {
  const statisticsData = await getStatisticsData();

  return <StatisticsClient data={statisticsData} />;
}
