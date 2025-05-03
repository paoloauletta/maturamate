import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

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
          <LoginLink>
            <Button className="w-full py-6 text-lg" size="lg">
              Accedi
            </Button>
          </LoginLink>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-300 w-full absolute"></div>
            <span className="relative px-4 bg-background text-sm text-muted-foreground">
              oppure
            </span>
          </div>

          <RegisterLink>
            <Button variant="outline" className="w-full py-6 text-lg" size="lg">
              Registrati
            </Button>
          </RegisterLink>
        </div>
      </div>
    </main>
  );
}
