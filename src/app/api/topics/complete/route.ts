import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  subtopicsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
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

    // Ensure user.id is string
    const userId = user.id.toString();

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
          eq(completedTopicsTable.user_id, userId),
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

    // Get all subtopics for this topic
    const subtopics = await db
      .select()
      .from(subtopicsTable)
      .where(eq(subtopicsTable.topic_id, topic_id));

    // Mark the topic as completed first
    await db.insert(completedTopicsTable).values({
      user_id: userId,
      topic_id: topic_id,
    });

    // Then mark all related subtopics as completed
    for (const subtopic of subtopics) {
      // Check if the subtopic is already completed
      const existingSubtopicCompletion = await db
        .select()
        .from(completedSubtopicsTable)
        .where(
          and(
            eq(completedSubtopicsTable.user_id, userId),
            eq(completedSubtopicsTable.subtopic_id, subtopic.id)
          )
        )
        .limit(1);

      // Only insert if not already completed
      if (existingSubtopicCompletion.length === 0) {
        await db.insert(completedSubtopicsTable).values({
          user_id: userId,
          subtopic_id: subtopic.id,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Topic and all subtopics marked as completed successfully",
        completedSubtopicIds: subtopics.map((s) => s.id),
      },
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
