import { db } from "@/db/drizzle";
import { completedSimulationsTable } from "@/db/schema";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId, userId } = await req.json();

    console.log("Starting simulation with data:", {
      simulationId,
      userId,
      userIdType: typeof userId,
      userIdFromAuth: user.id,
      userIdFromAuthType: typeof user.id,
    });

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get previous attempts for this simulation
    const previousAttempts = await db
      .select()
      .from(completedSimulationsTable)
      .where(
        and(
          eq(completedSimulationsTable.user_id, userId),
          eq(completedSimulationsTable.simulation_id, simulationId)
        )
      );

    console.log(
      "Found previous attempts:",
      previousAttempts.length,
      previousAttempts.map((a) => ({
        id: a.id,
        started_at: a.started_at,
        completed_at: a.completed_at,
      }))
    );

    // Calculate new attempt number
    const attemptNumber = previousAttempts.length + 1;

    console.log("Creating new simulation attempt:", {
      attemptNumber,
      userId,
      simulationId,
    });

    // Current timestamp for started_at
    const startTime = new Date();
    console.log("Start time:", startTime);

    // Insert a new record in the completedSimulationsTable
    const result = await db.insert(completedSimulationsTable).values({
      user_id: userId,
      simulation_id: simulationId,
      attempt: attemptNumber,
      started_at: startTime,
    });
    console.log("Insert result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting simulation:", error);
    // Add more detailed error response
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          message: "Internal Server Error",
          error: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
