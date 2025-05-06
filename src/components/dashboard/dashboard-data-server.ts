import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";

// Define the interface for the dashboard data
export interface DashboardData {
  userData: {
    name: string;
    daysToExam: number;
    overallProgress: number;
    uniqueCompletedExercises: number;
    totalAvailableExercises: number;
    totalExercises: number;
    correctExercises: number;
    incorrectExercises: number;
    simulationsCompleted: number;
    flaggedExercises: {
      total: number;
      items: Array<{
        id: string;
        title: string;
        path: string;
        difficulty: number;
      }>;
    };
    weakestTopic: string;
    weakestTopicData?: {
      id: string;
      name: string;
      accuracy: number;
    };
  };
  completionData: {
    topicsCompletionPercentage: number;
    completedTopics: number;
    totalTopics: number;
  };
  randomQuote: string;
  continueUrl: string;
}

// Get motivational quotes for the dashboard
const quotes = [
  "Il successo non è definitivo, il fallimento non è fatale: è il coraggio di continuare che conta.",
  "La preparazione è la chiave del successo.",
  "Ogni giorno è una nuova opportunità per migliorarsi.",
  "Non importa quanto vai piano, l'importante è non fermarsi.",
  "Il modo migliore per predire il futuro è crearlo.",
];

export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = session.user;

  // Mock data for the dashboard
  const mockDashboardData: DashboardData = {
    userData: {
      name: user.name?.split(" ")[0] || "studente",
      daysToExam: 30,
      overallProgress: 65,
      uniqueCompletedExercises: 120,
      totalAvailableExercises: 200,
      totalExercises: 150,
      correctExercises: 120,
      incorrectExercises: 30,
      simulationsCompleted: 5,
      flaggedExercises: {
        total: 8,
        items: [
          {
            id: "ex1",
            title: "Limiti e continuità",
            path: "/dashboard/esercizi/card/1",
            difficulty: 2,
          },
          {
            id: "ex2",
            title: "Equazioni differenziali",
            path: "/dashboard/esercizi/card/2",
            difficulty: 3,
          },
          {
            id: "ex3",
            title: "Studio di funzione",
            path: "/dashboard/esercizi/card/3",
            difficulty: 2,
          },
        ],
      },
      weakestTopic: "Integrali",
      weakestTopicData: {
        id: "topic1",
        name: "Integrali",
        accuracy: 45,
      },
    },
    completionData: {
      topicsCompletionPercentage: 70,
      completedTopics: 7,
      totalTopics: 10,
    },
    randomQuote: quotes[Math.floor(Math.random() * quotes.length)],
    continueUrl: "/dashboard/teoria/math101",
  };

  return mockDashboardData;
}
