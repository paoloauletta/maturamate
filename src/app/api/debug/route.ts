import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const headers = Object.fromEntries(request.headers);
  const cookies = request.headers.get("cookie");

  return NextResponse.json({
    user: user ? { id: user.id, email: user.email } : null,
    cookies,
    headers: {
      host: headers.host,
      referer: headers.referer,
      "user-agent": headers["user-agent"],
    },
  });
}
