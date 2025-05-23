"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PdfViewer from "@/app/components/shared/renderer/pdf-renderer";
import { Solution } from "@/types/simulationsTypes";

interface SolutionViewerProps {
  selectedSolution: Solution | null;
}

export default function SolutionViewer({
  selectedSolution,
}: SolutionViewerProps) {
  if (!selectedSolution) {
    return (
      <div className="md:col-span-2 flex items-center justify-center h-full bg-muted/30 rounded-lg p-12">
        <p className="text-muted-foreground">
          Seleziona una soluzione per visualizzarla
        </p>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
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
                <Button variant="default" size="lg" className="text-white">
                  <Bot className="mr-2 h-5 w-5" />
                  Chiedi a Mathy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
