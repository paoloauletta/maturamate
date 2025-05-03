import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import SettingsClient from "./client";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch user data from database to get username
  const userData = await db
    .select({
      username: usersTable.username,
    })
    .from(usersTable)
    .where(eq(usersTable.id, user.id as string))
    .limit(1);

  const username = userData[0]?.username || "";

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Impostazioni Account</h1>
      <SettingsClient
        id={user.id as string}
        email={user.email as string}
        givenName={user.given_name as string}
        familyName={user.family_name as string}
        picture={user.picture as string}
        username={username}
      />
    </div>
  );
}
