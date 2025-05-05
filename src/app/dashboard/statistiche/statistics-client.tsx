"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, XCircle, BookOpen, PenTool, GraduationCap } from "lucide-react";
import { UserStatistics } from "@/lib/data/user-statistics";
import Link from "next/link";

interface CompletionData {
  totalTopics: number;
  completedTopics: number;
  topicsCompletionPercentage: number;
  totalSubtopics: number;
  completedSubtopics: number;
  subtopicsCompletionPercentage: number;
  firstUncompletedTopic: any;
  firstUncompletedSubtopic: any;
}

interface StatisticsClientProps {
  userStats: UserStatistics;
  completionData: CompletionData;
}

export function StatisticsClient({
  userStats,
  completionData,
}: StatisticsClientProps) {
  // Calculate percentages
  const correctPercentage = Math.round(
    (userStats.correctExercises / userStats.totalExercises) * 100 || 0
  );

  // Build the continue learning URL
  let continueUrl = "/dashboard/teoria";
  if (completionData.firstUncompletedTopic) {
    continueUrl = `/dashboard/teoria/${completionData.firstUncompletedTopic.id}`;
    if (completionData.firstUncompletedSubtopic) {
      continueUrl += `?subtopic=${completionData.firstUncompletedSubtopic.id}`;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Le mie statistiche
        </h1>
      </section>

      {/* Overall Performance Summary */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Complessivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.overallProgress}%
            </div>
            <Progress value={userStats.overallProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.uniqueCompletedExercises} di{" "}
              {userStats.totalAvailableExercises} esercizi completati
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
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
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-1 text-primary"
              asChild
            >
              <Link href={continueUrl}>
                <GraduationCap className="h-3 w-3 mr-1 inline" />
                Continua lo studio
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Esercizi Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalExercises}</div>
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${correctPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {correctPercentage}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">
                <span className="text-green-500 font-medium">
                  {userStats.correctExercises}
                </span>{" "}
                corretti
              </span>
              <span className="text-xs">
                <span className="text-red-500 font-medium">
                  {userStats.incorrectExercises}
                </span>{" "}
                errati
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Esercizi flaggati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.flaggedExercises.total}
            </div>
            {userStats.flaggedExercises.total > 0 && (
              <div className="mt-2 space-y-1">
                {userStats.flaggedExercises.items.slice(0, 3).map((item, i) => (
                  <Link
                    key={i}
                    href={item.path}
                    className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors truncate"
                  >
                    <Flag className="h-3 w-3 mr-1 text-yellow-500 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
                {userStats.flaggedExercises.total > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    + altri {userStats.flaggedExercises.total - 3}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Progress by Topic */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Progresso per argomento</CardTitle>
            <CardDescription>
              Percentuale di completamento per ogni argomento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {userStats.topicProgress.map((topic, index) => {
                const completionPercentage =
                  topic.total > 0
                    ? Math.round((topic.completed / topic.total) * 100)
                    : 0;

                const accuracyPercentage =
                  topic.totalAttempts > 0
                    ? Math.round(
                        (topic.correctAttempts / topic.totalAttempts) * 100
                      )
                    : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{topic.topic}</div>
                      <div className="text-sm text-muted-foreground">
                        {completionPercentage}%
                      </div>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Accuratezza:{" "}
                      <span
                        className={
                          accuracyPercentage < 60
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {accuracyPercentage}%
                      </span>{" "}
                      su {topic.totalAttempts} tentativi
                    </div>
                  </div>
                );
              })}

              {userStats.topicProgress.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Nessun argomento completato
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weakest Subtopics */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Argomenti da migliorare</CardTitle>
            <CardDescription>Sottocategorie con più errori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {userStats.weakSubtopics.map((subtopic, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 mt-1 rounded-full p-1.5 bg-red-100 dark:bg-red-950">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{subtopic.subtopic}</h4>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-red-500">
                          {subtopic.wrongCount}
                        </span>{" "}
                        errori
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {subtopic.topic}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/teoria/${subtopic.topicId}?subtopic=${subtopic.subtopicId}`}
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Teoria
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/esercizi/${subtopic.topicId}?subtopic=${subtopic.subtopicId}`}
                        >
                          <PenTool className="h-3.5 w-3.5 mr-1" />
                          Esercizi
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {userStats.weakSubtopics.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Nessun dato disponibile sugli errori
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
