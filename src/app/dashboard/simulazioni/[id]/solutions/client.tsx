"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/components/loading/loading-spinner";

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

interface Solution {
  id: string;
  simulation_id: string;
  title: string;
  pdf_url: string;
  order_index: number | null;
}

interface SolutionsClientProps {
  simulation: Simulation;
  solutions: Solution[];
}

export default function SolutionsClient({
  simulation,
  solutions,
}: SolutionsClientProps) {
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(
    solutions.length > 0 ? solutions[0] : null
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const router = useRouter();
  const [isRestarting, setIsRestarting] = useState(false);

  // State for collapsible sections
  const [problemiExpanded, setProblemiExpanded] = useState(true);
  const [quesitiExpanded, setQuesitiExpanded] = useState(true);

  // Separate solutions into Problemi and Quesiti
  const problemiSolutions = solutions.filter(
    (sol) =>
      sol.title.toLowerCase().includes("problema") ||
      sol.title.toLowerCase().includes("problem")
  );

  const quesitiSolutions = solutions.filter(
    (sol) =>
      sol.title.toLowerCase().includes("quesito") ||
      sol.title.toLowerCase().includes("quesit")
  );

  // Other solutions that don't match either category
  const otherSolutions = solutions.filter(
    (sol) => !problemiSolutions.includes(sol) && !quesitiSolutions.includes(sol)
  );

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
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  // Load the PDF document when selectedSolution changes
  useEffect(() => {
    let isComponentMounted = true;

    if (!selectedSolution) return;

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
      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import("pdfjs-dist");

        // Set up the worker using the file we copied to the public directory
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

        // Get the document using our proxy for external URLs
        const proxyUrl = getProxyUrl(selectedSolution.pdf_url);

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
        setIsLoading(false);
      }
    };

    loadPDF();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      cleanup();
    };
  }, [selectedSolution]);

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

  // Format time in minutes to hours and minutes
  const formatTimeInHours = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "ora" : "ore"}`;
    }

    return `${hours} ${hours === 1 ? "ora" : "ore"} e ${remainingMinutes} min`;
  };

  // Handle restart simulation
  const handleRestartSimulation = async () => {
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
        // Navigate back to the simulation page
        router.push(`/dashboard/simulazioni/${simulation.id}`);
      } else {
        console.error("Failed to restart simulation");
      }
    } catch (error) {
      console.error("Error restarting simulation:", error);
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4">
          <Link href="/dashboard/simulazioni">
            <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span>Torna alle simulazioni</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center mb-8 border-b pb-4 border-border">
          <h1 className="text-4xl font-bold text-left">Soluzioni</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {/* Problemi Section */}
          {problemiSolutions.length > 0 && (
            <Card>
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setProblemiExpanded(!problemiExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Problemi ({problemiSolutions.length})
                  </CardTitle>
                  {problemiExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {problemiExpanded && (
                <CardContent className="pt-2 space-y-2">
                  {problemiSolutions.map((solution) => (
                    <Button
                      key={solution.id}
                      variant={
                        selectedSolution?.id === solution.id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedSolution(solution);
                        setIsLoading(true);
                      }}
                    >
                      {solution.title}
                    </Button>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Quesiti Section */}
          {quesitiSolutions.length > 0 && (
            <Card>
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setQuesitiExpanded(!quesitiExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Quesiti ({quesitiSolutions.length})
                  </CardTitle>
                  {quesitiExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {quesitiExpanded && (
                <CardContent className="pt-2 space-y-2">
                  {quesitiSolutions.map((solution) => (
                    <Button
                      key={solution.id}
                      variant={
                        selectedSolution?.id === solution.id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedSolution(solution);
                        setIsLoading(true);
                      }}
                    >
                      {solution.title}
                    </Button>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Other Solutions (not categorized) */}
          {otherSolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Altre soluzioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {otherSolutions.map((solution) => (
                  <Button
                    key={solution.id}
                    variant={
                      selectedSolution?.id === solution.id
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSolution(solution);
                      setIsLoading(true);
                    }}
                  >
                    {solution.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedSolution ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedSolution.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative min-h-[500px]">
                {selectedSolution && (
                  <div
                    ref={containerRef}
                    style={{
                      width: "100%",
                      height: "500px",
                      position: "relative",
                      overflow: "auto",
                    }}
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
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-center items-center min-h-[500px]">
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
                        <LoadingSpinner text="Caricamento PDF..." size="sm" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg p-12">
              <p className="text-muted-foreground">
                Seleziona una soluzione per visualizzarla
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
