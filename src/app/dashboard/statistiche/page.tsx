import { Suspense } from "react";
import { getStatisticsData } from "./statistics-data-server";
import { StatisticsClient } from "./statistics-client";
import { StatisticsLoadingSkeleton } from "@/app/components/dashboard/statistics-loading-server";

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsLoadingSkeleton />}>
      <StatisticsContent />
    </Suspense>
  );
}

async function StatisticsContent() {
  const statisticsData = await getStatisticsData();

  return <StatisticsClient data={statisticsData} />;
}
