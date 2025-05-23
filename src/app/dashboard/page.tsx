import { Suspense } from "react";
import { DashboardSkeleton } from "@/app/components/shared/loading";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { completedSimulationsTable, simulationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  BookOpen,
  ArrowRight,
  Award,
  Clock,
  BookCheck,
  LineChart,
} from "lucide-react";

// Force dynamic rendering since this page uses headers() indirectly through auth()
export const dynamic = "force-dynamic";

// Calculate days until Matura (June 19, 2025)
function getDaysUntilMatura() {
  const today = new Date();
  const maturaDate = new Date(2025, 5, 19); // June is month 5 (0-indexed)
  const diffTime = Math.abs(maturaDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function DashboardIndexPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  try {
    // Get current user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch user's completed simulations
    const userCompletedSimulations =
      await db.query.completedSimulationsTable.findMany({
        where: eq(completedSimulationsTable.user_id, userId),
        orderBy: (simulations, { desc }) => [desc(simulations.created_at)],
      });

    // Calculate statistics
    const completedSimulationIds = userCompletedSimulations.map(
      (sim) => sim.simulation_id
    );

    // Count unique completed simulations
    const uniqueCompletedSimulations = new Set(completedSimulationIds).size;

    // Get total simulations count
    const allSimulations = await db.query.simulationsTable.findMany();
    const totalSimulations = allSimulations.length;

    const daysToMatura = getDaysUntilMatura();

    // Get user's name
    const userName = session?.user?.name || "Studente";

    // Calculate completion percentage
    const completionPercentage =
      totalSimulations > 0
        ? Math.round((uniqueCompletedSimulations / totalSimulations) * 100)
        : 0;

    // Random motivational quotes
    const quotes = [
      "La perseveranza è la chiave del successo.",
      "Ogni giorno di studio è un passo verso il tuo futuro.",
      "Non importa quanto vai piano, l'importante è non fermarsi.",
      "La maturità è l'inizio di una nuova avventura.",
      "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Get last completed simulation date
    const lastCompletedSimulation = userCompletedSimulations[0];
    const lastCompletedDate = lastCompletedSimulation
      ? new Date(
          lastCompletedSimulation.completed_at ||
            lastCompletedSimulation.created_at
        ).toLocaleDateString("it-IT")
      : "Mai";

    return (
      <div className="flex flex-col gap-8 pb-8 mx-auto max-w-7xl">
        {/* Hero Banner */}
        <div className="relative w-full pt-4 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,#000)]" />
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Ciao, {userName}!
                </h1>
                <p className="text-muted-foreground mt-2 italic">
                  {randomQuote}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
                <CalendarDays className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Esame di Maturità
                  </p>
                  <p className="font-semibold text-amber-500">
                    {daysToMatura} giorni rimanenti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Il tuo percorso
            </CardTitle>
            <CardDescription>
              Riepilogo del tuo progresso nelle simulazioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso complessivo</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Totale simulazioni
                    </p>
                    <p className="text-xl font-bold">{totalSimulations}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BookCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completate</p>
                    <p className="text-xl font-bold">
                      {uniqueCompletedSimulations}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ultima completata
                    </p>
                    <p className="text-md font-medium">{lastCompletedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full text-white">
              <Link href="/dashboard/simulazioni">
                Tutte le simulazioni
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Simulation Card */}
          <Card className="flex flex-col justify-between bg-gradient-to-br from-primary/5 to-background border-primary/20">
            <div className="flex flex-col gap-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Nuova simulazione
                </CardTitle>
                <CardDescription>
                  Metti alla prova le tue conoscenze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Inizia una nuova simulazione completa dell'esame di maturità
                  per testare la tua preparazione e identificare le aree da
                  migliorare.
                </p>
              </CardContent>
            </div>
            <CardFooter>
              <Button asChild variant="default" className="w-full text-white">
                <Link href="/dashboard/simulazioni">
                  Inizia una nuova simulazione
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Study Tips Card */}
          <Card className="bg-gradient-to-br from-amber-500/5 to-background border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Suggerimenti di studio
              </CardTitle>
              <CardDescription>
                Consigli per prepararti al meglio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 flex items-center justify-center bg-amber-500/10 text-amber-600 mt-0.5">
                    1
                  </div>
                  <p>Completa almeno una simulazione a settimana</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 flex items-center justify-center bg-amber-500/10 text-amber-600 mt-0.5">
                    2
                  </div>
                  <p>Rivedi gli argomenti in cui hai più difficoltà</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 flex items-center justify-center bg-amber-500/10 text-amber-600 mt-0.5">
                    3
                  </div>
                  <p>Mantieni un ritmo costante di studio</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                asChild
                className="w-full border-amber-500/20 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800"
              >
                <Link href="/dashboard/statistiche">
                  Le tue statistiche
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Si è verificato un errore durante il caricamento della dashboard.
        </p>
      </div>
    );
  }
}
