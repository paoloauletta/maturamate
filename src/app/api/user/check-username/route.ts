import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // Check if user has a username set
    const userInfo = await db
      .select({
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .then((res) => res[0] || { username: "" });

    return NextResponse.json(
      { hasUsername: !!userInfo.username },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username", hasUsername: false },
      { status: 500 }
    );
  }
}
