"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  FileCheck,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import "@/app/globals/styles/pdf-viewer.css";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Apply fixes when entering/exiting fullscreen
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [fullscreen]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
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
    <div
      className={`${
        fullscreen
          ? "fixed inset-0 z-50 bg-background flex flex-col"
          : "container py-8"
      }`}
    >
      <div className={`${fullscreen ? "px-4 py-2 border-b" : "mb-8"}`}>
        <div className="flex justify-between items-center">
          <div>
            <Link
              href={`/dashboard/simulazioni/${simulation.id}`}
              className="flex items-center text-muted-foreground hover:text-foreground mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Torna alla simulazione
            </Link>
            <h1 className="text-2xl font-bold">
              {fullscreen ? selectedSolution?.title : "Soluzioni"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!fullscreen && (
              <Link href="/dashboard/simulazioni">
                <Button variant="outline" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Tutte le simulazioni
                </Button>
              </Link>
            )}

            {fullscreen && (
              <Button variant="outline" onClick={toggleFullscreen}>
                <Minimize2 className="h-4 w-4 mr-1" />
                Esci
              </Button>
            )}
          </div>
        </div>
      </div>

      {!fullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni</CardTitle>
                <CardDescription>
                  Soluzioni disponibili per {simulation.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/simulazioni" className="w-full">
                  <Button variant="outline" className="w-full mb-4">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Tutte le simulazioni
                  </Button>
                </Link>
              </CardContent>
            </Card>

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

                    <Button variant="outline" onClick={toggleFullscreen}>
                      <Maximize2 className="h-4 w-4 mr-1" />
                      Schermo intero
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative min-h-[500px] h-[500px]">
                  {selectedSolution && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        src={`${selectedSolution.pdf_url}#toolbar=0&navpanes=0&view=FitH`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          background: "#f5f5f5",
                        }}
                        title={selectedSolution.title}
                        onLoad={handleIframeLoad}
                      />
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
      )}

      {fullscreen && selectedSolution && (
        <div className="flex-1 flex flex-col">
          <div style={{ position: "relative", flex: 1 }}>
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10,
                background: "white",
                borderRadius: "4px",
                padding: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title="Exit Fullscreen"
                className="h-8 px-2"
              >
                <Minimize2 className="h-4 w-4 mr-1" />
                Esci
              </Button>
            </div>

            {selectedSolution && (
              <iframe
                ref={iframeRef}
                src={`${selectedSolution.pdf_url}#toolbar=0&navpanes=0&view=FitH`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "#f5f5f5",
                }}
                title={selectedSolution.title}
                onLoad={handleIframeLoad}
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <LoadingSpinner text="Caricamento PDF..." size="sm" />
              </div>
            )}
          </div>

          {solutions.length > 1 && (
            <div className="p-2 w-full bg-background border-t flex justify-center items-center">
              <div className="flex flex-wrap justify-center gap-2">
                {solutions.map((solution) => (
                  <Button
                    key={solution.id}
                    variant={
                      selectedSolution?.id === solution.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedSolution(solution);
                      setIsLoading(true);
                    }}
                  >
                    {solution.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
