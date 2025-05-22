"use client";

import Link from "next/link";
import { CheckCircle, FileText, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Simulation } from "@/types/simulationsTypes";
import { useSearchParams } from "next/navigation";

interface CompletedViewProps {
  simulation: Simulation;
  isRestarting: boolean;
  onStartOver: () => Promise<void>;
}

export default function CompletedView({
  simulation,
  isRestarting,
  onStartOver,
}: CompletedViewProps) {
  // Get the referrer from URL params
  const searchParams = useSearchParams();
  const referrer = searchParams.get("referrer");

  // Determine the back path and text based on the referrer
  const getBackDetails = () => {
    switch (referrer) {
      case "statistiche":
        return {
          path: "/dashboard/statistiche",
          text: "Torna alle statistiche",
        };
      case "preferiti":
        return {
          path: "/dashboard/preferiti",
          text: "Torna ai preferiti",
        };
      default:
        return {
          path: "/dashboard/simulazioni",
          text: "Torna alle simulazioni",
        };
    }
  };

  const { path, text } = getBackDetails();

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
        <div className="relative w-full max-w-2xl flex justify-center">
          <Link href={path}>
            <div className="absolute -top-10 left-0 text-muted-foreground items-center w-fit gap-1 flex flex-row hover:text-foreground transition-all z-10">
              <ArrowLeft className="h-4 w-4" />
              <span>{text}</span>
            </div>
          </Link>
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
            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                variant="outline"
                onClick={onStartOver}
                disabled={isRestarting}
                className="w-full sm:w-auto"
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
              <Link
                href={`/dashboard/simulazioni/${simulation.id}/solutions`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="default"
                  className="text-white w-full sm:w-auto"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Vedi Soluzioni
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
