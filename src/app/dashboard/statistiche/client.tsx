"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  BarChart3,
  Award,
  CalendarDays,
  CheckCircle2,
  Timer,
  History,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface MonthlyActivity {
  month: string;
  year: number;
  count: number;
  yearMonth: string;
}

interface RecentSimulation {
  id: string;
  title: string;
  date: string;
  attempt: number;
  simulationId: string;
}

interface StatisticsData {
  totalSimulations: number;
  completedSimulations: number;
  completionPercentage: number;
  totalTimeSpent: number;
  monthlyActivity: MonthlyActivity[];
  recentSimulations: RecentSimulation[];
}

interface StatisticsClientProps {
  data: StatisticsData;
}

export function SimulationsStatisticsClient({ data }: StatisticsClientProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const {
    totalSimulations,
    completedSimulations,
    completionPercentage,
    totalTimeSpent,
    monthlyActivity,
    recentSimulations,
  } = data;

  // Find the month with the most simulations completed
  const mostActiveMonth = monthlyActivity.reduce(
    (max, month) => (month.count > max.count ? month : max),
    { month: "", year: 0, count: 0, yearMonth: "" }
  );

  // Format time from minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate max value for chart scaling
  const maxMonthlyCount = Math.max(...monthlyActivity.map((m) => m.count), 1);

  return (
    <div className="flex flex-col gap-8 pb-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="relative w-full pt-4 md:p-6 overflow-hidden">
        <div className="relative">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Statistiche simulazioni
              </h1>
              <p className="text-muted-foreground mt-2">
                Riepilogo dettagliato dei tuoi progressi
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Percentuale completamento
                </p>
                <p className="font-semibold text-primary">
                  {completionPercentage}% completato
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Simulazioni totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSimulations}</div>
            <Progress value={100} className="h-1 mt-2 bg-primary/20" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Simulazioni completate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSimulations}</div>
            <Progress
              value={completionPercentage}
              className="h-1 mt-2 bg-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {completionPercentage}% di completamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Tempo totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(totalTimeSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo speso sulle simulazioni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              Mese più attivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostActiveMonth.count > 0
                ? `${mostActiveMonth.month} ${mostActiveMonth.year}`
                : "Nessuno"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mostActiveMonth.count} simulazioni completate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed stats */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger value="activity">Attività mensile</TabsTrigger>
          <TabsTrigger value="recent">Simulazioni recenti</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Attività mensile
              </CardTitle>
              <CardDescription>
                Simulazioni completate negli ultimi 6 mesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-end justify-between gap-2 mt-4 px-2">
                {monthlyActivity.map((month) => (
                  <div
                    key={month.yearMonth}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <div
                      className="w-full max-w-[40px] bg-primary/20 rounded-t-md relative group"
                      style={{
                        height: month.count
                          ? `${(month.count / maxMonthlyCount) * 180}px`
                          : "4px",
                      }}
                    >
                      {month.count > 0 && (
                        <div
                          className="absolute inset-0 bg-primary rounded-t-md"
                          style={{
                            height: "100%",
                            opacity: 0.8,
                          }}
                        />
                      )}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {month.count}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {month.month}
                    </div>
                  </div>
                ))}
              </div>

              {monthlyActivity.every((m) => m.count === 0) && (
                <div className="text-center text-muted-foreground my-12">
                  Nessuna attività negli ultimi 6 mesi
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    L'attività mostrata è relativa alle simulazioni completate
                    in ciascun mese
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Simulazioni recenti
              </CardTitle>
              <CardDescription>
                Le ultime simulazioni che hai completato
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSimulations.length > 0 ? (
                <div className="space-y-4">
                  {recentSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-primary/10">
                          <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{sim.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Tentativo {sim.attempt} • {sim.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/simulazioni/${sim.simulationId}?referrer=statistiche`}
                        >
                          Dettagli
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Non hai ancora completato nessuna simulazione
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/simulazioni?referrer=statistiche">
                  Tutte le simulazioni
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to action */}
      <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Migliora la tua preparazione
          </CardTitle>
          <CardDescription>
            Continua a esercitarti con le simulazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Prova a completare almeno una simulazione a settimana per ottenere i
            migliori risultati e prepararti al meglio per l'esame di maturità.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/dashboard/simulazioni?referrer=statistiche">
              Inizia una nuova simulazione
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
