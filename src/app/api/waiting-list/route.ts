import { db } from "@/db/drizzle";
import { waitingList } from "@/db/schema";
import { sendWaitingListConfirmation } from "@/lib/email";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    // First check if the user exists and is unsubscribed
    const existingUser = await db
      .select()
      .from(waitingList)
      .where(eq(waitingList.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // If user exists and is unsubscribed, reactivate them
      if (existingUser[0].unsubscribed) {
        await db
          .update(waitingList)
          .set({ unsubscribed: false })
          .where(eq(waitingList.email, email));
        await sendWaitingListConfirmation(email);
        return NextResponse.json({ success: true });
      }
      // If user exists and is already subscribed, return 409
      return NextResponse.json(
        { error: "Already on the list" },
        { status: 409 }
      );
    }

    // If user doesn't exist, create new entry
    await db.insert(waitingList).values({ email });
    await sendWaitingListConfirmation(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in waiting list subscription:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
