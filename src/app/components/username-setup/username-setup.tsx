"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface UsernameSetupFormProps {
  userId: string;
  email: string;
  name: string;
}

export default function UsernameSetupForm({
  userId,
  email,
  name,
}: UsernameSetupFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Inserisci un nome utente");
      toast.error("Inserisci un nome utente");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update username");
      }

      toast.success("Nome utente impostato con successo!");

      // Redirect to dashboard after successful update
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Failed to set username:", error);
      setError(error.message || "Errore nell'impostazione del nome utente");
      toast.error(error.message || "Errore nell'impostazione del nome utente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome Utente</Label>
            <Input
              id="username"
              placeholder="Inserisci un nome utente"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(""); // Clear error when user types
              }}
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
              required
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Questo nome utente sarà visibile agli altri utenti
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Email: {email}</p>
            {name && <p>Nome: {name}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-white cursor-pointer"
          >
            {isSubmitting ? "Salvataggio..." : "Continua"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
