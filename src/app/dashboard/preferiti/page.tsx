import { PageLoading } from "@/app/components/loading/page-loading.server";
import { FavoritesList } from "./client";

export default async function FavoritesPage() {
  return (
    <PageLoading loadingText="Caricamento preferiti...">
      <div className=" py-6">
        <FavoritesList />
      </div>
    </PageLoading>
  );
}
