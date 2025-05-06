import { Suspense } from "react";
import { getStatisticsData } from "./statistics-data-server";
import { StatisticsClient } from "./statistics-client";
import { StatisticsSkeleton } from "@/components/loading/statistics-skeleton";

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
