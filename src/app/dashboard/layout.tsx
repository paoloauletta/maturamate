import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to homepage if not authenticated
  if (!session || !session.user) {
    redirect("/");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
