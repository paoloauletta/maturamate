import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import {
  users,
  completedTopicsTable,
  completedSubtopicsTable,
  completedExercisesTable,
  completedExercisesCardsTable,
  flaggedExercisesTable,
  flaggedExercisesCardsTable,
  completedSimulationsTable,
  flaggedSimulationsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("Starting account deletion for user:", user.id);

    try {
      // Without transactions, delete all user-related data sequentially
      console.log("Deleting user data sequentially");

      // Delete all user's completed topics
      await db
        .delete(completedTopicsTable)
        .where(eq(completedTopicsTable.user_id, user.id));
      console.log("Deleted completed topics");

      // Delete all user's completed subtopics
      await db
        .delete(completedSubtopicsTable)
        .where(eq(completedSubtopicsTable.user_id, user.id));
      console.log("Deleted completed subtopics");

      // Delete all user's completed exercises
      await db
        .delete(completedExercisesTable)
        .where(eq(completedExercisesTable.user_id, user.id));
      console.log("Deleted completed exercises");

      // Delete all user's completed exercise cards
      await db
        .delete(completedExercisesCardsTable)
        .where(eq(completedExercisesCardsTable.user_id, user.id));
      console.log("Deleted completed exercise cards");

      // Delete all user's flagged exercises
      await db
        .delete(flaggedExercisesTable)
        .where(eq(flaggedExercisesTable.user_id, user.id));
      console.log("Deleted flagged exercises");

      // Delete all user's flagged exercise cards
      await db
        .delete(flaggedExercisesCardsTable)
        .where(eq(flaggedExercisesCardsTable.user_id, user.id));
      console.log("Deleted flagged exercise cards");

      // Delete all user's completed simulations
      await db
        .delete(completedSimulationsTable)
        .where(eq(completedSimulationsTable.user_id, user.id));
      console.log("Deleted completed simulations");

      // Delete all user's flagged simulations
      await db
        .delete(flaggedSimulationsTable)
        .where(eq(flaggedSimulationsTable.user_id, user.id));
      console.log("Deleted flagged simulations");

      // Finally, delete the user
      await db.delete(users).where(eq(users.id, user.id));
      console.log("Deleted user account");

      console.log("Account deletion completed successfully");
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      throw new Error(
        `Database operation failed: ${dbError?.message || "Unknown error"}`
      );
    }

    // Send a flag that the client can use to redirect to the logout URL
    return NextResponse.json(
      {
        message: "Account deleted successfully",
        shouldLogout: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        error: "Failed to delete account",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
