import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { waitingList } from "@/db/schema";
import { validateUnsubscribeToken } from "@/lib/unsubscribe";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token || !validateUnsubscribeToken(email, token)) {
    return NextResponse.redirect("/unsubscribe/error");
  }

  await db
    .update(waitingList)
    .set({ unsubscribed: true })
    .where(eq(waitingList.email, email));

  return NextResponse.redirect("/unsubscribe/success");
}
