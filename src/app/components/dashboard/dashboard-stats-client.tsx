"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type DashboardData } from "@/app/dashboard/dashboard-data-server";
import { useState, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  progress?: number;
  subtitle?: string;
}

export function StatCard({ title, value, progress, subtitle }: StatCardProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined && (
          <Progress value={progress} className="h-2 mt-2" />
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const { userData, completionData } = data;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="Progresso Complessivo"
        value={`${userData.overallProgress}%`}
        progress={userData.overallProgress}
        subtitle={`${userData.uniqueCompletedExercises} di ${userData.totalAvailableExercises} esercizi completati`}
      />

      <StatCard
        title="Argomenti Completati"
        value={`${completionData.topicsCompletionPercentage}%`}
        progress={completionData.topicsCompletionPercentage}
        subtitle={`${completionData.completedTopics} di ${completionData.totalTopics} argomenti`}
      />

      <StatCard
        title="Esercizi completati"
        value={userData.totalExercises}
        subtitle={`${userData.correctExercises} corretti, ${userData.incorrectExercises} errati`}
      />

      <StatCard
        title="Simulazioni completate"
        value={userData.simulationsCompleted}
      />
    </section>
  );
}
