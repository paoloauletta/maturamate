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
  CheckCircle,
  FileText,
  Minimize2,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  TabletSmartphone,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // PDF.js state
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);

  // PDF.js refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

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

  // Function to get proxy URL for PDFs
  const getProxyUrl = (originalUrl: string) => {
    // For local PDFs (those hosted on our server), use them directly
    if (typeof window === "undefined") return originalUrl;

    if (
      originalUrl.startsWith("/") ||
      originalUrl.startsWith(window.location.origin)
    ) {
      return originalUrl;
    }

    // For external PDFs, use our proxy
    return `/api/pdf-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  // Function to render PDF page
  const renderPage = async (num: number) => {
    if (!pdfDocRef.current) return;

    setIsLoading(true);

    try {
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (e) {
          console.log("Error cancelling previous render task:", e);
        }
        renderTaskRef.current = null;
      }

      const page = await pdfDocRef.current.getPage(num);
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Clear previous content
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const viewport = page.getViewport({ scale, rotation: rotation });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Store the render task to be able to cancel it if needed
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("cancelled")) {
        console.log("Rendering was cancelled");
      } else if (
        error instanceof Error &&
        error.message.includes("Transport destroyed")
      ) {
        console.log("Transport destroyed - PDF document may have been closed");
      } else {
        console.error("Error rendering page:", error);
      }
      setIsLoading(false);
    }
  };

  // Load the PDF document
  useEffect(() => {
    let isComponentMounted = true;

    if (!simulation.pdf_url) return;

    setIsLoading(true);
    setPageNum(1);

    // Clean up previous resources
    const cleanup = () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          console.log("Error cancelling render task during cleanup:", e);
        }
        renderTaskRef.current = null;
      }

      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch (e) {
          console.log("Error destroying PDF document during cleanup:", e);
        }
        pdfDocRef.current = null;
      }
    };

    // Clean up previous instance
    cleanup();

    const loadPDF = async () => {
      let retries = 3;
      const loadWithRetry = async () => {
        try {
          // Dynamically import PDF.js
          const pdfjsLib = await import("pdfjs-dist");

          // Set up the worker using the file we copied to the public directory
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

          // Get the document using our proxy for external URLs
          const proxyUrl = getProxyUrl(simulation.pdf_url);

          // Create loading task with better error handling
          const loadingTask = pdfjsLib.getDocument(proxyUrl);
          loadingTask.onPassword = (
            updatePassword: (password: string) => void,
            reason: number
          ) => {
            console.log("Password required for PDF:", reason);
            // You could implement a password prompt here
            return Promise.resolve();
          };

          // Await the document with a timeout
          const pdfDoc = (await Promise.race([
            loadingTask.promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("PDF loading timeout")), 30000)
            ),
          ])) as any; // Type assertion to handle the PDF document

          // Check if component is still mounted before updating state
          if (!isComponentMounted) {
            pdfDoc.destroy();
            return;
          }

          // Store the PDF document reference
          pdfDocRef.current = pdfDoc;
          setNumPages(pdfDoc.numPages);

          // Render the first page
          await renderPage(1);
        } catch (error) {
          console.error("Error loading PDF:", error);
          if (retries > 0) {
            console.log(`Retrying PDF load... (${3 - retries + 1}/3)`);
            retries -= 1;
            await loadWithRetry();
          } else {
            setIsLoading(false);
            console.error("Failed to load PDF after multiple attempts.");
          }
        }
      };

      await loadWithRetry();
    };

    loadPDF();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      cleanup();
    };
  }, [simulation.pdf_url]);

  // Re-render the page when scale or rotation changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pageNum);
    }
  }, [scale, rotation]);

  // Navigation functions
  const goToPreviousPage = () => {
    if (pageNum <= 1) return;
    setPageNum((prev) => {
      const newPage = prev - 1;
      renderPage(newPage);
      return newPage;
    });
  };

  const goToNextPage = () => {
    if (pageNum >= numPages) return;
    setPageNum((prev) => {
      const newPage = prev + 1;
      renderPage(newPage);
      return newPage;
    });
  };

  // Zoom functions
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Rotation function
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Toggle fullscreen mode for the PDF canvas
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!fullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
          setFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setFullscreen(false);
        }
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

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
              Conferma
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
              className="bg-primary hover:bg-primary/90"
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
        <div className="absolute inset-0 py-4  sm:p-6 flex flex-col">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-border/30 flex flex-col">
            {/* PDF.js Canvas Renderer */}
            <div
              ref={containerRef}
              className="flex-1 w-full h-full relative overflow-auto"
            >
              <div className="absolute top-0 left-0 right-0 z-10 p-2 flex justify-between items-center">
                {/* Page navigation controls */}
                <div className="bg-background/90 rounded-full px-3 py-1">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={pageNum <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {pageNum} / {numPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={pageNum >= numPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* PDF controls */}
                <div className="bg-background/90 rounded-lg p-1 flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    title="Zoom Out"
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    title="Zoom In"
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={rotate}
                    title="Rotate"
                    className="h-8 w-8 p-0"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    className="h-8 w-8 p-0"
                  >
                    {fullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center items-center min-h-[100%]">
                <canvas
                  ref={canvasRef}
                  style={{
                    margin: "0 auto",
                    display: "block",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-muted-foreground">
                      Caricamento PDF...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
