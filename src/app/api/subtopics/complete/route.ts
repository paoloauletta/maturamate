import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import { completedSubtopicsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { subtopic_id } = body;

    if (!subtopic_id) {
      return NextResponse.json(
        { error: "Subtopic ID is required" },
        { status: 400 }
      );
    }

    // Check if the subtopic is already marked as completed by this user
    const existingEntry = await db
      .select()
      .from(completedSubtopicsTable)
      .where(
        and(
          eq(completedSubtopicsTable.user_id, user.id),
          eq(completedSubtopicsTable.subtopic_id, subtopic_id)
        )
      )
      .limit(1);

    // If it's already completed, just return success
    if (existingEntry.length > 0) {
      return NextResponse.json(
        { message: "Subtopic already marked as completed" },
        { status: 200 }
      );
    }

    // Mark the subtopic as completed
    await db.insert(completedSubtopicsTable).values({
      user_id: user.id,
      subtopic_id: subtopic_id,
    });

    return NextResponse.json(
      { message: "Subtopic marked as completed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error marking subtopic as completed:", error);
    return NextResponse.json(
      { error: "Failed to mark subtopic as completed" },
      { status: 500 }
    );
  }
}
