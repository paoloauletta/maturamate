"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PdfViewer from "@/app/components/shared/renderer/pdf-renderer";
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
import { Simulation } from "@/types/simulationsTypes";
import TimerDisplay from "./timer-display";
import { ArrowLeft } from "lucide-react";

interface ActiveSimulationProps {
  simulation: Simulation;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  onComplete: () => Promise<void>;
}

export default function ActiveSimulation({
  simulation,
  timeRemaining,
  formatTime,
  onComplete,
}: ActiveSimulationProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

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
            <AlertDialogAction onClick={onComplete}>
              <span className="text-white">Conferma</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-background sticky top-0 py-3 px-4 border-b z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center">
          <Link href="/dashboard/simulazioni" className="block mr-3">
            <div className="text-muted-foreground items-center w-fit gap-1 flex flex-row hover:text-foreground transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Torna alle simulazioni</span>
            </div>
          </Link>
          <h1 className="text-xl font-medium">{simulation.title}</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <TimerDisplay timeRemaining={timeRemaining} formatTime={formatTime} />

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
