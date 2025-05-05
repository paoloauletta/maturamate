import { db } from "@/db/drizzle";
import { flaggedSimulationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = await req.json();

    // Check if the simulation is already flagged
    const existingFlag = await db
      .select()
      .from(flaggedSimulationsTable)
      .where(
        and(
          eq(flaggedSimulationsTable.user_id, user.id),
          eq(flaggedSimulationsTable.simulation_id, simulationId)
        )
      );

    if (existingFlag.length > 0) {
      // If the simulation is already flagged, remove it
      await db
        .delete(flaggedSimulationsTable)
        .where(
          and(
            eq(flaggedSimulationsTable.user_id, user.id),
            eq(flaggedSimulationsTable.simulation_id, simulationId)
          )
        );
      return NextResponse.json({ flagged: false });
    } else {
      // If the simulation is not flagged, add it
      await db.insert(flaggedSimulationsTable).values({
        user_id: user.id,
        simulation_id: simulationId,
      });
      return NextResponse.json({ flagged: true });
    }
  } catch (error) {
    console.error("Error toggling simulation flag:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
