import { db } from "@/db/drizzle";
import { waitingList } from "@/db/schema";
import { sendWaitingListConfirmation } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await db.insert(waitingList).values({ email });
    await sendWaitingListConfirmation(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as any).code === "23505") {
      return NextResponse.json(
        { error: "Already on the list" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
