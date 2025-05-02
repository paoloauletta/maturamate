"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import "@/app/globals/styles/pdf-viewer.css";

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100); // Default zoom level
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const handleStartOver = () => {
    setShowConfirmation(true);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Zoom functions
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200)); // Max zoom 200%
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50)); // Min zoom 50%
  };

  const resetZoom = () => {
    setZoom(100);
  };

  // Apply zoom to iframe using CSS transform
  useEffect(() => {
    if (iframeRef.current) {
      // Get the iframe's document
      const iframeDoc = iframeRef.current;
      // Use CSS transform to scale the content
      iframeDoc.style.transform = `scale(${zoom / 100})`;
      iframeDoc.style.transformOrigin = "top center";
    }
  }, [zoom, fullscreen]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // If the user has completed this simulation, show solutions page
  if (isCompleted) {
    return (
      <div className="container py-8">
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
            <Button variant="outline" onClick={handleStartOver}>
              Ripeti Simulazione
            </Button>
            <Link href={`/dashboard/simulazioni/${simulation.id}/solutions`}>
              <Button>
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
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sei pronto per iniziare la simulazione?</CardTitle>
            <CardDescription>
              {simulation.title} - {simulation.subject}, {simulation.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{simulation.description}</p>

              <div className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>
                  Una volta iniziata, avrai{" "}
                  <strong>
                    {getHumanReadableDuration(simulation.time_in_min)}
                  </strong>{" "}
                  per completare la simulazione. Il timer inizierà
                  immediatamente.
                </p>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Durata: {getHumanReadableDuration(simulation.time_in_min)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/simulazioni">
              <Button variant="outline">Torna alle simulazioni</Button>
            </Link>
            <Button onClick={handleStartSimulation}>Inizia Simulazione</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show the actual simulation with timer
  return (
    <div
      className={`container py-4 ${
        fullscreen ? "fixed inset-0 z-50 bg-background" : ""
      }`}
    >
      <div className="sticky top-0 z-10 bg-background py-2 border-b mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{simulation.title}</h1>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 font-mono text-lg ${
              timeRemaining < 300 ? "text-red-500" : ""
            }`}
          >
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
          <Button onClick={handleCompleteSimulation}>
            Termina Simulazione
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className={`pdf-container ${fullscreen ? "pdf-fullscreen" : ""}`}
        >
          <div className="pdf-controls">
            <div className="zoom-controls">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                title="Reset Zoom"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4 mr-1" />
              {fullscreen ? "Esci" : "Schermo intero"}
            </Button>
          </div>

          <iframe
            ref={iframeRef}
            src={`${simulation.pdf_url}#toolbar=1&navpanes=1&view=FitH`}
            className="w-full h-full border-0"
            title={simulation.title}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              visibility: isLoading ? "hidden" : "visible",
            }}
            onLoad={handleIframeLoad}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
                <p className="text-gray-600">Caricamento PDF...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
