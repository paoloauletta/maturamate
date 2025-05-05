import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageLoading } from "@/app/components/loading/page-loading.server";
import { FavoritesList } from "./client";

export default async function FavoritesPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    redirect("/api/auth/signin");
  }

  return (
    <PageLoading loadingText="Caricamento preferiti...">
      <div className="container py-6">
        <FavoritesList />
      </div>
    </PageLoading>
  );
}
