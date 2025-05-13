"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, FileText, TabletSmartphone } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PdfViewer from "@/app/components/shared/renderer/pdf-renderer";

interface Simulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  year: number;
  subject: string;
  time_in_min: number;
  is_complete: boolean;
}

interface SimulationClientProps {
  simulation: Simulation;
  userId: string;
  hasStarted: boolean;
  isCompleted: boolean;
  completedSimulationId: string | null;
  startedAt?: string | null;
}

export default function SimulationClient({
  simulation,
  userId,
  hasStarted,
  isCompleted,
  completedSimulationId,
  startedAt,
}: SimulationClientProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(!hasStarted);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Calculate initial time remaining based on start time
  const calculateInitialTimeRemaining = () => {
    if (!hasStarted || isCompleted || !startedAt) {
      return simulation.time_in_min * 60; // Default to full time in seconds
    }

    const startTime = new Date(startedAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const totalSeconds = simulation.time_in_min * 60;
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

    return remainingSeconds;
  };

  const [timeRemaining, setTimeRemaining] = useState<number>(
    calculateInitialTimeRemaining()
  );
  const [timerActive, setTimerActive] = useState(hasStarted && !isCompleted);
  const [isRestarting, setIsRestarting] = useState(false);

  // Start the timer when a user begins a simulation
  useEffect(() => {
    if (!timerActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive]);

  // Format time based on duration
  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      // Format as hours:minutes:seconds when >= 1 hour
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      // Format as minutes:seconds when < 1 hour
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Get human-readable duration for display
  const getHumanReadableDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "ora" : "ore"}`;
      } else {
        return `${hours} ${hours === 1 ? "ora" : "ore"} e ${remainingMinutes} ${
          remainingMinutes === 1 ? "minuto" : "minuti"
        }`;
      }
    } else {
      return `${minutes} ${minutes === 1 ? "minuto" : "minuti"}`;
    }
  };

  // Start a new simulation
  const handleStartSimulation = async () => {
    try {
      const response = await fetch("/api/simulations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationId: simulation.id,
          userId,
        }),
      });

      if (response.ok) {
        setShowConfirmation(false);
        setTimerActive(true);
        router.refresh();
      } else {
        // Try to get more detailed error info
        try {
          const errorData = await response.json();
          console.error("Failed to start simulation:", errorData);
        } catch {
          console.error(
            "Failed to start simulation with status:",
            response.status
          );
        }
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  };

  // Complete a simulation
  const handleCompleteSimulation = async () => {
    if (!hasStarted || isCompleted) return;

    try {
      const response = await fetch("/api/simulations/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationId: simulation.id,
          completedSimulationId,
          userId,
        }),
      });

      if (response.ok) {
        setTimerActive(false);
        router.push(`/dashboard/simulazioni/${simulation.id}/solutions`);
      } else {
        console.error("Failed to complete simulation");
      }
    } catch (error) {
      console.error("Error completing simulation:", error);
    }
  };

  // Start over/do again
  const handleStartOver = async () => {
    try {
      setIsRestarting(true);
      // Call API to reset simulation status and increment attempt counter
      const response = await fetch("/api/simulations/restart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationId: simulation.id,
        }),
      });

      if (response.ok) {
        // Show the confirmation screen to start the new attempt
        setShowConfirmation(true);
        router.refresh();
      } else {
        console.error("Failed to restart simulation");
      }
    } catch (error) {
      console.error("Error restarting simulation:", error);
    } finally {
      setIsRestarting(false);
    }
  };

  // If the user has completed this simulation, show solutions page
  if (isCompleted) {
    return (
      <div>
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
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleStartSimulation}
              disabled={isRestarting}
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
            <Link href={`/dashboard/simulazioni/${simulation.id}/solutions`}>
              <Button variant="default" className="text-white">
                <FileText className="mr-2 h-4 w-4" />
                Vedi Soluzioni
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show confirmation page before starting the simulation
  if (showConfirmation) {
    return (
      <div className="px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-2xl w-full border-border">
          <CardHeader>
            <CardTitle className="text-2xl">
              Sei pronto per iniziare la simulazione?
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Main simulation information */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-1">{simulation.title}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{simulation.subject}</span>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40 mx-2" />
                <span>{simulation.year}</span>
              </div>
            </div>

            {/* Duration information */}
            <div className="flex-col items-start text-muted-foreground border border-border/50 rounded-md p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <p className="font-medium text-foreground">
                  Durata: {getHumanReadableDuration(simulation.time_in_min)}
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
          <CardFooter className="border-t border-border/30 pt-4 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Link href="/dashboard/simulazioni" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto cursor-pointer"
              >
                Torna alle simulazioni
              </Button>
            </Link>
            <Button
              onClick={handleStartSimulation}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto cursor-pointer text-white"
            >
              Inizia Simulazione
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show the actual simulation with timer
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "min-h-screen flex flex-col"
      }
    >
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sei sicuro di voler terminare la simulazione?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata e la simulazione verrà
              considerata completata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteSimulation}>
              <span className="text-white">Conferma</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-background sticky top-0 py-3 px-4 border-b z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center">
          <h1 className="text-xl font-medium">{simulation.title}</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`flex items-center justify-center rounded-md border ${
              timeRemaining < 300
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                : "border-border/30 bg-muted/20"
            } px-3 py-1.5`}
          >
            <Clock
              className={`h-4 w-4 mr-2 ${
                timeRemaining < 300 ? "text-red-500" : ""
              }`}
            />
            <span
              className={`font-mono text-base ${
                timeRemaining < 300 ? "text-red-500 font-bold" : ""
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="flex gap-2 flex-1 sm:flex-initial justify-end">
            <Button
              onClick={() => setShowCompleteDialog(true)}
              variant="default"
              className="text-white"
              size="sm"
            >
              Termina Simulazione
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 w-full relative ${
          fullscreen ? "h-[calc(100vh-112px)]" : "h-[calc(100vh-180px)]"
        }`}
      >
        <div className="absolute inset-0 py-4 sm:p-6 flex flex-col">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-border/30 flex flex-col">
            {/* Use the unified PDF Viewer component */}
            <PdfViewer
              pdfUrl={simulation.pdf_url}
              height="100%"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
