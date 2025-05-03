import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getUserStatistics } from "@/lib/data/user-statistics";

export async function GET(request: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

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
