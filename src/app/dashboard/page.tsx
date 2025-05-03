import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  BookOpen,
  Bot,
  ChartNoAxesColumn,
  ClipboardCheck,
  Flag,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import {
  getUserStatistics,
  getDaysUntilExam,
  getUserStreak,
  getWeeklyGoals,
} from "@/lib/data/user-statistics";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardIndexPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id;

  // Default mock data in case we don't have a userId
  let userData = {
    name: user?.given_name || "Studente",
    daysToExam: getDaysUntilExam(),
    overallProgress: 0,
    totalAvailableExercises: 0,
    uniqueCompletedExercises: 0,
    totalExercises: 0,
    correctExercises: 0,
    incorrectExercises: 0,
    weekExercises: 0,
    simulationsCompleted: 0,
    weakestTopic: "Derivate",
    streakDays: getUserStreak(),
    weeklyGoal: getWeeklyGoals(),
    flaggedExercises: [] as Array<{ id: string; title: string; path: string }>,
  };

  // Default completion data
  let completionData = {
    totalTopics: 0,
    completedTopics: 0,
    topicsCompletionPercentage: 0,
    totalSubtopics: 0,
    completedSubtopics: 0,
    subtopicsCompletionPercentage: 0,
    firstUncompletedTopic: null as any,
    firstUncompletedSubtopic: null as any,
  };

  // Get real data if we have a userId
  if (userId) {
    const userStats = await getUserStatistics(userId);

    // Find weakest topic (lowest accuracy rate)
    let weakestTopic = "Algebra";
    let lowestAccuracy = 100;

    for (const topic of userStats.topicProgress) {
      const accuracy =
        topic.completed > 0
          ? Math.round((topic.correct / topic.completed) * 100)
          : 0;
      if (accuracy < lowestAccuracy && topic.completed > 0) {
        lowestAccuracy = accuracy;
        weakestTopic = topic.topic;
      }
    }

    // Override mock data with real data
    userData = {
      ...userData,
      totalExercises: userStats.totalExercises,
      correctExercises: userStats.correctExercises,
      incorrectExercises: userStats.incorrectExercises,
      weekExercises: userStats.weekExercises,
      simulationsCompleted: userStats.simulationsCompleted,
      weakestTopic,
      flaggedExercises: userStats.flaggedExercises.items,
      overallProgress: userStats.overallProgress,
      totalAvailableExercises: userStats.totalAvailableExercises,
      uniqueCompletedExercises: userStats.uniqueCompletedExercises,
    };

    // Get topics and subtopics completion statistics
    const allTopics = await db
      .select()
      .from(topicsTable)
      .orderBy(topicsTable.order_index);
    const allSubtopics = await db
      .select()
      .from(subtopicsTable)
      .orderBy(subtopicsTable.order_index);

    const completedTopics = await db
      .select({
        topic_id: completedTopicsTable.topic_id,
      })
      .from(completedTopicsTable)
      .where(eq(completedTopicsTable.user_id, userId));

    const completedSubtopics = await db
      .select({
        subtopic_id: completedSubtopicsTable.subtopic_id,
      })
      .from(completedSubtopicsTable)
      .where(eq(completedSubtopicsTable.user_id, userId));

    // Create sets for faster lookup
    const completedTopicIds = new Set(completedTopics.map((t) => t.topic_id));
    const completedSubtopicIds = new Set(
      completedSubtopics.map((s) => s.subtopic_id)
    );

    // Find the first uncompleted topic and subtopic
    const firstUncompletedTopic = allTopics.find(
      (topic) => !completedTopicIds.has(topic.id)
    );

    let firstUncompletedSubtopic = null;
    if (firstUncompletedTopic) {
      const topicSubtopics = allSubtopics.filter(
        (s) => s.topic_id === firstUncompletedTopic.id
      );
      firstUncompletedSubtopic = topicSubtopics.find(
        (subtopic) => !completedSubtopicIds.has(subtopic.id)
      );
    }

    // Calculate completion percentages
    const topicsCompletionPercentage =
      allTopics.length > 0
        ? Math.round((completedTopics.length / allTopics.length) * 100)
        : 0;

    const subtopicsCompletionPercentage =
      allSubtopics.length > 0
        ? Math.round((completedSubtopics.length / allSubtopics.length) * 100)
        : 0;

    completionData = {
      totalTopics: allTopics.length,
      completedTopics: completedTopics.length,
      topicsCompletionPercentage,
      totalSubtopics: allSubtopics.length,
      completedSubtopics: completedSubtopics.length,
      subtopicsCompletionPercentage,
      firstUncompletedTopic,
      firstUncompletedSubtopic,
    };
  }

  // Mock motivational quotes
  const quotes = [
    "La costanza è la chiave del successo.",
    "Ogni giorno di studio ti avvicina all'obiettivo.",
    "Non conta quanto vai veloce, l'importante è non fermarsi.",
    "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.",
  ];

  // Random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Build the continue learning URL
  let continueUrl = "/dashboard/teoria";
  if (completionData.firstUncompletedTopic) {
    continueUrl = `/dashboard/teoria/${completionData.firstUncompletedTopic.id}`;
    if (completionData.firstUncompletedSubtopic) {
      continueUrl += `?subtopic=${completionData.firstUncompletedSubtopic.id}`;
    }
  }

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

      {/* Progress Overview */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Complessivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.overallProgress}%
            </div>
            <Progress value={userData.overallProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {userData.uniqueCompletedExercises} di{" "}
              {userData.totalAvailableExercises} esercizi completati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Argomenti Completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionData.topicsCompletionPercentage}%
            </div>
            <Progress
              value={completionData.topicsCompletionPercentage}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {completionData.completedTopics} di {completionData.totalTopics}{" "}
              argomenti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Esercizi completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.totalExercises}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{userData.weekExercises} questa settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Simulazioni completate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.simulationsCompleted}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Suggested Action & Goals */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Prossima azione consigliata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Continue Learning Block */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Continua lo studio
              </h3>
              <p className="text-sm text-muted-foreground">
                {completionData.firstUncompletedTopic
                  ? `Continua con l'argomento "${completionData.firstUncompletedTopic.name}"`
                  : "Completa tutti gli argomenti per prepararti al meglio"}
              </p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700" asChild>
                <Link href={continueUrl}>Continua lo studio</Link>
              </Button>
            </div>

            {/* Weakest Topic Block */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="text-lg font-semibold mb-2">
                Continua l'esercizio su {userData.weakestTopic}
              </h3>
              <p className="text-sm text-muted-foreground">
                Questo argomento richiede più attenzione in base ai tuoi
                risultati precedenti.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/esercizi">Vai agli esercizi</Link>
              </Button>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-2">
                Obiettivo settimanale
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">
                      Simulazioni: {userData.simulationsCompleted}/
                      {userData.weeklyGoal.simulations}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        (userData.simulationsCompleted /
                          userData.weeklyGoal.simulations) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (userData.simulationsCompleted /
                        userData.weeklyGoal.simulations) *
                      100
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">
                      Esercizi: {userData.weekExercises}/
                      {userData.weeklyGoal.exercises}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        (userData.weekExercises /
                          userData.weeklyGoal.exercises) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (userData.weekExercises / userData.weeklyGoal.exercises) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-2">
                Sequenza giornaliera
              </h3>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded-full ${
                      i < userData.streakDays ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {userData.streakDays}{" "}
                {userData.streakDays === 1 ? "giorno" : "giorni"} consecutivi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Exercises */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Esercizi con difficoltà</CardTitle>
            <CardDescription>Esercizi da rivedere</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userData.flaggedExercises.length > 0 ? (
                userData.flaggedExercises.map((exercise) => (
                  <Link href={exercise.path} key={exercise.id}>
                    <div className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer">
                      <Flag className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">{exercise.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Nessun esercizio flaggato
                </div>
              )}
            </div>
          </CardContent>
          {userData.flaggedExercises.length > 0 && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/preferiti">
                  Vedi tutti gli esercizi flaggati
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Accesso rapido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/teoria">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Book className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Esplora argomenti</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/simulazioni">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <ClipboardCheck className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Simulazioni d'esame</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tutor">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Bot className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Tutor AI</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/statistiche">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <ChartNoAxesColumn className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Le mie statistiche</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
