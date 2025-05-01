import { db } from "@/db/drizzle";
import { topicsTable } from "@/db/schema";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function TheoryPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch first topic to redirect to
  const topics = await db
    .select({
      id: topicsTable.id,
    })
    .from(topicsTable)
    .orderBy(topicsTable.order_index)
    .limit(1);

  // Redirect to the first topic page
  if (topics.length > 0) {
    redirect(`/dashboard/teoria/${topics[0].id}`);
  } else {
    // If no topics exist, create a placeholder message
    return (
      <div className="container text-center">
        <h1 className="text-3xl font-bold mb-4">Teoria</h1>
        <p className="text-muted-foreground">
          Non ci sono ancora argomenti disponibili.
        </p>
      </div>
    );
  }
}
