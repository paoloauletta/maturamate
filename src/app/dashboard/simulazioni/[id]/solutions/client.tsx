"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  FileCheck,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
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
    null
  );
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100); // Default zoom level
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Handle solution selection
  const handleViewSolution = (solution: Solution) => {
    setSelectedSolution(solution);
    setZoom(100); // Reset zoom when changing solution
    setIsLoading(true); // Reset loading state for new solution
  };

  // Render PDF viewer when a solution is selected
  if (selectedSolution) {
    return (
      <div className="container py-4">
        <div className="sticky top-0 z-10 bg-background py-2 border-b mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSolution(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Torna alle soluzioni
            </Button>
            <h1 className="text-xl font-bold">{selectedSolution.title}</h1>
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
              src={`${selectedSolution.pdf_url}#toolbar=1&navpanes=1&view=FitH`}
              className="w-full h-full border-0"
              title={selectedSolution.title}
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

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/simulazioni/${simulation.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Torna alla Simulazione
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Soluzioni: {simulation.title}</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hai completato la simulazione!</CardTitle>
            <CardDescription>
              {simulation.subject} - {simulation.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{simulation.description}</p>
            <p className="text-muted-foreground">
              Di seguito trovi le soluzioni ufficiali della simulazione. Puoi
              visualizzarle direttamente o scaricarle in formato PDF.
            </p>
          </CardContent>
        </Card>

        {solutions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Soluzioni Disponibili
            </h2>

            {solutions.map((solution) => (
              <Card
                key={solution.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {solution.order_index !== null && solution.order_index > 0
                        ? `${solution.order_index}. `
                        : ""}
                      {solution.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSolution(solution)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Visualizza
                      </Button>
                      <Link href={solution.pdf_url} download>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Scarica
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}

            <Separator className="my-8" />

            {/* Link to all simulations */}
            <div className="flex justify-between items-center pt-4">
              <Link href="/dashboard/simulazioni">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna alle Simulazioni
                </Button>
              </Link>

              <Link href={`/dashboard/simulazioni/${simulation.id}`}>
                <Button>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Ripeti Simulazione
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-lg">
              Non ci sono ancora soluzioni disponibili per questa simulazione.
            </p>
            <Link href="/dashboard/simulazioni" className="mt-4 inline-block">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alle Simulazioni
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
