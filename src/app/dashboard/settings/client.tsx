"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";

// Create a standalone LogoutButton component
export function LogoutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Button variant="outline" onClick={handleSignOut} className="gap-2">
      <LogOut className="h-4 w-4" />
      Disconnetti
    </Button>
  );
}

interface SettingsClientProps {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  picture: string;
  username: string;
}

export default function SettingsClient({
  id,
  email,
  givenName,
  familyName,
  picture,
  username: initialUsername,
}: SettingsClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(`${givenName} ${familyName}`.trim());
  const [username, setUsername] = useState(initialUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(picture || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileUpdate = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          fullName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast.success("Profilo aggiornato con successo");
      setIsEditing(false);

      // Refresh page after successful update
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account eliminato con successo");

      // Sign out the user using Auth.js
      setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 1500);
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast.error(
        `Errore nell'eliminazione dell'account: ${
          error?.message || "Errore sconosciuto"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Title and Logout Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Impostazioni Account</h1>
        <LogoutButton />
      </div>

      {/* Profile Information Section */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle>Informazioni Profilo</CardTitle>
          <CardDescription>
            Gestisci le tue informazioni personali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 md:pb-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden border-2 border-border">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile Picture"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <span className="text-3xl font-bold text-muted-foreground">
                      {fullName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  La tua email non può essere modificata
                </p>
              </div>

              {!isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <div className="flex items-center justify-between mt-1">
                      <p>{fullName || "Non impostato"}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="flex items-center justify-between mt-1">
                      <p>{username || "Non impostato"}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nome Completo</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Il tuo nome completo"
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Il tuo username"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Salvataggio..." : "Salva"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annulla
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Danger Section */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-destructive">Zona Pericolosa</CardTitle>
          <CardDescription>
            Azioni irreversibili per il tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 md:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">Elimina Account</p>
              <p className="text-sm text-muted-foreground">
                Questa azione è irreversibile e tutti i tuoi dati verranno
                eliminati.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="sm:w-auto w-full mt-2 sm:mt-0 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione è irreversibile. Tutti i tuoi dati, inclusi
                    progressi, preferiti e statistiche verranno eliminati
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={deleteAccount}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Eliminazione..." : "Sì, elimina account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
