"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, School } from "lucide-react";

interface Simulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  year: number;
  subject: string;
  time_in_min: number;
  is_complete: boolean;
  is_completed: boolean;
  is_started: boolean;
}

interface ClientSimulationsPageProps {
  simulationsByYear: Record<number, Simulation[]>;
  sortedYears: number[];
  userId: string;
}

export default function ClientSimulationsPage({
  simulationsByYear,
  sortedYears,
  userId,
}: ClientSimulationsPageProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  // Get unique subjects for filter dropdown
  const allSimulations = Object.values(simulationsByYear).flat();
  const subjects = Array.from(
    new Set(allSimulations.map((sim) => sim.subject))
  ).sort();

  // Filter simulations by subject if a filter is applied
  const filterSimulations = (simulations: Simulation[]) => {
    if (subjectFilter === "all") return simulations;
    return simulations.filter((sim) => sim.subject === subjectFilter);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <h1 className="text-4xl font-bold">Simulazioni</h1>

        <div className="flex items-center gap-4">
          {/* Subject filter dropdown - to be implemented */}
          <div className="text-sm text-muted-foreground">
            {subjectFilter === "all"
              ? "Tutte le materie"
              : `Materia: ${subjectFilter}`}
          </div>
        </div>
      </div>

      {sortedYears.length > 0 ? (
        sortedYears.map((year) => {
          const filteredSimulations = filterSimulations(
            simulationsByYear[year]
          );

          // Skip rendering year section if no simulations match filter
          if (filteredSimulations.length === 0) return null;

          return (
            <div key={year} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                Simulazioni {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSimulations.map((simulation) => (
                  <Link
                    href={`/dashboard/simulazioni/${simulation.id}`}
                    key={simulation.id}
                  >
                    <Card className="h-full transform transition-all hover:scale-[1.02] hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{simulation.title}</CardTitle>
                          {simulation.is_completed && (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completata
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <School className="h-4 w-4 mr-1" />
                          {simulation.subject}
                          <span className="mx-2">•</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          {simulation.year}
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          {simulation.time_in_min} min
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {simulation.description.length > 120
                            ? `${simulation.description.substring(0, 120)}...`
                            : simulation.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge
                            variant={
                              simulation.is_complete ? "default" : "outline"
                            }
                            className="px-2 py-1"
                          >
                            {simulation.is_complete ? "Completa" : "Parziale"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            {simulation.is_completed
                              ? "Rivedi Simulazione"
                              : simulation.is_started
                              ? "Continua Simulazione"
                              : "Inizia Simulazione"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center p-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg">
            Non ci sono ancora simulazioni disponibili.
          </p>
        </div>
      )}
    </div>
  );
}
