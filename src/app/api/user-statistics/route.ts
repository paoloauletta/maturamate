import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserStatistics } from "@/lib/data/user-statistics";

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Check if the user is authenticated
  if (!user || !user.id) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 }
    );
  }

  try {
    const userId = user.id;
    const statistics = await getUserStatistics(userId);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch user statistics" }),
      { status: 500 }
    );
  }
}
