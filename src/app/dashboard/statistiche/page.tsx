import { Suspense } from "react";
import { StatisticsClient } from "./statistics-client";
import { StatisticsSkeleton } from "@/app/components/shared/loading";

// Set revalidation period - revalidate every hour
export const revalidate = 3600;

// Mock data for statistics
const mockStatisticsData = {
  userStats: {
    name: "Studente",
    overallProgress: 65,
    uniqueCompletedExercises: 78,
    totalAvailableExercises: 120,
    totalExercises: 85,
    correctExercises: 70,
    incorrectExercises: 15,
    simulationsCompleted: 3,
    flaggedExercises: {
      total: 5,
      items: [
        {
          title: "Derivate di funzioni composte",
          path: "/dashboard/esercizi/matematica",
        },
        {
          title: "Integrali definiti",
          path: "/dashboard/esercizi/matematica",
        },
        {
          title: "Limiti notevoli",
          path: "/dashboard/esercizi/matematica",
        },
      ],
    },
    topicProgress: [
      {
        topic: "Matematica",
        completed: 24,
        total: 30,
        totalAttempts: 42,
        correctAttempts: 35,
      },
      {
        topic: "Italiano",
        completed: 15,
        total: 25,
        totalAttempts: 22,
        correctAttempts: 18,
      },
      {
        topic: "Fisica",
        completed: 10,
        total: 20,
        totalAttempts: 18,
        correctAttempts: 10,
      },
    ],
    weakSubtopics: [
      {
        subtopic: "Integrali indefiniti",
        wrongCount: 8,
        topicId: "matematica",
        subtopicId: "integrali",
      },
      {
        subtopic: "Meccanica quantistica",
        wrongCount: 5,
        topicId: "fisica",
        subtopicId: "quantistica",
      },
      {
        subtopic: "Analisi del periodo",
        wrongCount: 4,
        topicId: "italiano",
        subtopicId: "analisi",
      },
    ],
  },
  completionData: {
    totalTopics: 12,
    completedTopics: 7,
    topicsCompletionPercentage: 58,
    totalSubtopics: 48,
    completedSubtopics: 24,
    subtopicsCompletionPercentage: 50,
    firstUncompletedTopic: {
      id: "fisica",
      name: "Fisica",
    },
    firstUncompletedSubtopic: {
      id: "elettromagnetismo",
      name: "Elettromagnetismo",
    },
  },
  continueUrl: "/dashboard/teoria/fisica?subtopic=elettromagnetismo",
};

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsSkeleton />}>
      <StatisticsContent />
    </Suspense>
  );
}

async function StatisticsContent() {
  // Use mock data instead of fetching
  const statisticsData = mockStatisticsData;

  return <StatisticsClient data={statisticsData} />;
}
