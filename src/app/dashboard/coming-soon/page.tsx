"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "already"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const submit = async () => {
    const res = await fetch("/api/waiting-list", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("already");
    } else {
      setStatus("error");
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubscribed(true);
      toast.success("Ti avviseremo quando saremo pronti!");
      setEmail("");
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova più tardi.");
      console.error("Error subscribing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center bg-background min-h-0 md:px-0 px-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Questa funzionalità</span>{" "}
          <span className="text-primary">sta arrivando</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
          Stiamo lavorando per portarti nuovi strumenti che ti aiuteranno nella
          preparazione della matura. Iscriviti per essere il primo a sapere
          quando sarà disponibile.
        </p>
        {!isSubscribed ? (
          <form
            onSubmit={handleSubscribe}
            className="mt-12 w-full max-w-md mx-auto"
          >
            <div className="flex w-full">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                  className="w-full h-12 rounded-l-lg border border-input bg-white px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                onClick={submit}
                className="h-12 rounded-r-lg bg-primary text-white px-4 py-2 text-sm font-medium flex items-center justify-center transition-opacity disabled:opacity-70"
              >
                {isLoading ? "Invio..." : "Notificami"}{" "}
                <Bell className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <>
            {status === "success" && (
              <div className="justify-center items-center mt-12 p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 max-w-lg mx-auto">
                <p className="text-green-500">
                  Grazie! Ti invieremo un'email quando saremo pronti.
                </p>
              </div>
            )}
            {status === "already" && (
              <div className="justify-center items-center mt-12 p-4 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20 max-w-lg mx-auto">
                <p className="text-yellow-500">
                  Sei già nella lista! Ti invieremo un'email quando saremo
                  pronti.
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="justify-center items-center mt-12 p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 max-w-lg mx-auto">
                <p className="text-red-500">
                  Si è verificato un errore. Riprova più tardi.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="border-gray-200 hover:bg-gray-50 flex items-center gap-2"
        >
          Torna indietro <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
