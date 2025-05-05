import { db } from "@/db/drizzle";
import {
  flaggedSimulationsTable,
  simulationsTable,
  completedSimulationsTable,
  simulationsCardsTable,
} from "@/db/schema";
import { eq, and, or, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET handler to retrieve flagged simulations for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensuring that user.id is a string before using it in database operations
    const userId = user.id as string;

    // Fetch flagged simulations and join with cards to get year and subject
    const flaggedSimulations = await db
      .select({
        id: simulationsTable.id,
        title: simulationsTable.title,
        description: simulationsTable.description,
        pdf_url: simulationsTable.pdf_url,
        time_in_min: simulationsTable.time_in_min,
        is_complete: simulationsTable.is_complete,
        year: simulationsCardsTable.year,
        subject: simulationsCardsTable.subject,
        created_at: flaggedSimulationsTable.created_at,
      })
      .from(flaggedSimulationsTable)
      .innerJoin(
        simulationsTable,
        eq(flaggedSimulationsTable.simulation_id, simulationsTable.id)
      )
      .innerJoin(
        simulationsCardsTable,
        eq(simulationsTable.card_id, simulationsCardsTable.id)
      )
      .where(eq(flaggedSimulationsTable.user_id, userId))
      .orderBy(flaggedSimulationsTable.created_at);

    // Process completion and started status for each simulation
    const processedSimulations = await Promise.all(
      flaggedSimulations.map(async (simulation) => {
        // Check if user has completed the simulation
        const completedQuery = await db
          .select({ id: completedSimulationsTable.id })
          .from(completedSimulationsTable)
          .where(
            and(
              eq(completedSimulationsTable.user_id, userId),
              eq(completedSimulationsTable.simulation_id, simulation.id),
              // Only consider as completed if the completed_at field is not null
              // This means the simulation was actually finished
              isNotNull(completedSimulationsTable.completed_at)
            )
          );

        const isCompleted = completedQuery.length > 0;

        // Check if user has started the simulation (started_at is set but completed_at might be null)
        const startedQuery = await db
          .select({ id: completedSimulationsTable.id })
          .from(completedSimulationsTable)
          .where(
            and(
              eq(completedSimulationsTable.user_id, userId),
              eq(completedSimulationsTable.simulation_id, simulation.id)
            )
          );

        const isStarted = startedQuery.length > 0;

        return {
          ...simulation,
          is_completed: isCompleted,
          is_started: isStarted || isCompleted, // If completed, it's also started
        };
      })
    );

    return NextResponse.json(processedSimulations);
  } catch (error) {
    console.error("Error fetching flagged simulations:", error);
    return NextResponse.json(
      { error: "Failed to fetch flagged simulations" },
      { status: 500 }
    );
  }
}
