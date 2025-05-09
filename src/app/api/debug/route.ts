import { NextResponse } from "next/server";
import { getTopics } from "@/utils/cache";

export async function GET() {
  try {
    // Get all topics to verify data access
    const topics = await getTopics();

    // Return diagnostic information
    return NextResponse.json({
      status: "success",
      message: "Debug API is working",
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      topicsCount: topics.length,
      topicIds: topics.map((t) => t.id),
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
