import { redirect } from "next/navigation";
import SignInButton from "./components/auth/sign-in";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            MaturaMate
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            La piattaforma ideale per prepararsi all'esame di maturità
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
