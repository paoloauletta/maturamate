"use client";

import Link from "next/link";
import { CheckCircle, FileText, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Simulation } from "@/types/simulationsTypes";

interface CompletedViewProps {
  simulation: Simulation;
  isRestarting: boolean;
  onStartOver: () => Promise<void>;
}

export default function CompletedView({
  simulation,
  isRestarting,
  onStartOver,
}: CompletedViewProps) {
  return (
    <>
      <div>
        <Link href="/dashboard/simulazioni">
          <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
            <ArrowLeft className="h-4 w-4" />
            <span>Torna alle simulazioni</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{simulation.title}</CardTitle>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardDescription>
              Hai già completato questa simulazione.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Puoi rivedere le soluzioni oppure ripetere la simulazione per
              esercitarti ulteriormente.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button
              variant="outline"
              onClick={onStartOver}
              disabled={isRestarting}
              className="w-full sm:w-auto"
            >
              {isRestarting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Riavvio...
                </>
              ) : (
                "Ripeti Simulazione"
              )}
            </Button>
            <Link
              href={`/dashboard/simulazioni/${simulation.id}/solutions`}
              className="w-full sm:w-auto"
            >
              <Button variant="default" className="text-white w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Vedi Soluzioni
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
