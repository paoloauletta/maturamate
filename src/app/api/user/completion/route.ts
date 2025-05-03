import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import {
  completedTopicsTable,
  completedSubtopicsTable,
  topicsTable,
  subtopicsTable,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getUserCompletionStatus } from "@/utils/cache";

export const GET = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Use the new cached function
    const completionData = await getUserCompletionStatus(user.id);

    // Set cache control headers - short max-age since this data changes
    return NextResponse.json(completionData, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching user completion:", error);
    return NextResponse.json(
      { error: "Failed to fetch completion status" },
      { status: 500 }
    );
  }
};
