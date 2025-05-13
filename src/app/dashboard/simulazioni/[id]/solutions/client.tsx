"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Bot,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import PdfViewer from "@/app/components/shared/renderer/pdf-renderer";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isRestarting, setIsRestarting] = useState(false);
  const router = useRouter();

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
        <div className="block md:hidden mb-4">
          <Link href="/dashboard/simulazioni">
            <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span>Torna alle simulazioni</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-between mb-8 border-b pb-4 border-border">
          <h1 className="text-4xl font-bold text-left">Soluzioni</h1>
          <Link href="/dashboard/simulazioni">
            <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
              <span>Torna alle simulazioni</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
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
                  <motion.div
                    animate={{ rotate: problemiExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {problemiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-2 space-y-2 text-white">
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
                          }}
                        >
                          {solution.title}
                        </Button>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <motion.div
                    animate={{ rotate: quesitiExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {quesitiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-2 space-y-2">
                      {quesitiSolutions.map((solution) => (
                        <Button
                          key={solution.id}
                          variant={
                            selectedSolution?.id === solution.id
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start text-white"
                          onClick={() => {
                            setSelectedSolution(solution);
                          }}
                        >
                          {solution.title}
                        </Button>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    className="w-full justify-start text-white"
                    onClick={() => {
                      setSelectedSolution(solution);
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
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedSolution.title}</CardTitle>
                    <div className="hidden md:block">
                      <Link href="/dashboard/tutor">
                        <Button
                          variant="default"
                          size="default"
                          className="text-white"
                        >
                          <Bot className="mr-2 h-5 w-5" />
                          Chiedi a Mathy
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative min-h-[500px]">
                  <PdfViewer
                    pdfUrl={selectedSolution.pdf_url}
                    height={500}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* Help card only visible on mobile - improved styling */}
              <Card className="py-4 px-4 md:hidden bg-primary/10 border-primary/20">
                <CardContent className="py-0 px-0">
                  <div className="flex flex-col items-center gap-0 text-center">
                    <p className="text-primary font-medium text-lg mb-2">
                      Non capisci la soluzione?
                    </p>
                    <Link href="/dashboard/tutor">
                      <Button
                        variant="default"
                        size="lg"
                        className="text-white"
                      >
                        <Bot className="mr-2 h-5 w-5" />
                        Chiedi a Mathy
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
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
