"use client";

import Link from "next/link";
import { Clock, TabletSmartphone, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Simulation } from "@/types/simulationsTypes";

interface ConfirmationViewProps {
  simulation: Simulation;
  onStartSimulation: () => Promise<void>;
  formatDuration: (minutes: number) => string;
}

export default function ConfirmationView({
  simulation,
  onStartSimulation,
  formatDuration,
}: ConfirmationViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
      <div className="relative w-full max-w-2xl flex justify-center">
        <Link href="/dashboard/simulazioni">
          <div className="absolute -top-10 left-0 text-muted-foreground items-center w-fit gap-1 flex flex-row hover:text-foreground transition-all z-10">
            <ArrowLeft className="h-4 w-4" />
            <span>Torna alle simulazioni</span>
          </div>
        </Link>
        <Card className="w-full border-border">
          <div className="pt-4">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sei pronto per iniziare la simulazione?
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {/* Main simulation information */}
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-1">{simulation.title}</h2>
                {simulation.subject && simulation.year && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{simulation.subject}</span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40 mx-2" />
                    <span>{simulation.year}</span>
                  </div>
                )}
              </div>

              {/* Duration information */}
              <div className="flex-col items-start text-muted-foreground border border-border/50 rounded-md p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium text-foreground">
                    Durata: {formatDuration(simulation.time_in_min)}
                  </p>
                </div>
                <p className="text-sm">
                  Avrai questo tempo per completare tutti gli esercizi.
                </p>
              </div>
              {/* Mobile disclaimer */}
              <div className="mt-6 md:hidden flex-col items-start bg-primary/10 border border-primary/20 text-primary rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TabletSmartphone className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium">Consiglio</p>
                </div>
                <p className="text-sm text-primary/80">
                  È consigliato svolgere le simulazioni da desktop o tablet per
                  una migliore esperienza.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4 flex justify-end">
              <Button
                onClick={onStartSimulation}
                variant={"default"}
                className="md:mx-0 mx-auto items-center justify-center"
              >
                Inizia Simulazione
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}
