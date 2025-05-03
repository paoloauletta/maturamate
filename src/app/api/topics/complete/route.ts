import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import { completedTopicsTable } from "@/db/schema";
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
    const { topic_id } = body;

    if (!topic_id) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    // Check if the topic is already marked as completed by this user
    const existingEntry = await db
      .select()
      .from(completedTopicsTable)
      .where(
        and(
          eq(completedTopicsTable.user_id, user.id),
          eq(completedTopicsTable.topic_id, topic_id)
        )
      )
      .limit(1);

    // If it's already completed, just return success
    if (existingEntry.length > 0) {
      return NextResponse.json(
        { message: "Topic already marked as completed" },
        { status: 200 }
      );
    }

    // Mark the topic as completed
    await db.insert(completedTopicsTable).values({
      user_id: user.id,
      topic_id: topic_id,
    });

    return NextResponse.json(
      { message: "Topic marked as completed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error marking topic as completed:", error);
    return NextResponse.json(
      { error: "Failed to mark topic as completed" },
      { status: 500 }
    );
  }
}
