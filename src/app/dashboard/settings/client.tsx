"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Upload, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  const [firstName, setFirstName] = useState(givenName || "");
  const [lastName, setLastName] = useState(familyName || "");
  const [username, setUsername] = useState(initialUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(picture || "");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      // Create a preview URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const saveProfileImage = async () => {
    try {
      if (!uploadedImage) return;

      setIsSubmitting(true);

      // Create form data properly
      const formData = new FormData();
      formData.append("image", uploadedImage, uploadedImage.name);

      // Log for debugging
      console.log(
        "Uploading image:",
        uploadedImage.name,
        uploadedImage.type,
        uploadedImage.size
      );

      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        // Don't set Content-Type header with FormData, browser will set it with boundary
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload profile image");
      }

      // Use the returned image URL instead of the local URL
      setProfileImage(data.imageUrl);
      toast.success("Immagine del profilo aggiornata");

      // Refresh the page to show updated image
      router.refresh();
    } catch (error) {
      console.error("Failed to upload profile image:", error);
      toast.error("Errore nel caricamento dell'immagine");
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

      // If the server indicates we should logout, redirect to the login page
      if (data.shouldLogout) {
        // Give the toast a moment to show before redirecting
        setTimeout(() => {
          // Make sure we redirect to a logout endpoint
          window.location.href = "/api/auth/logout";
        }, 1500);
      } else {
        // Redirect to home page after account deletion
        router.push("/");
      }
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
    <div className="space-y-10">
      {/* Profile Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Profilo</CardTitle>
          <CardDescription>
            Gestisci le tue informazioni personali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-border">
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
                      {firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Carica Immagine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carica Immagine Profilo</DialogTitle>
                    <DialogDescription>
                      Seleziona un'immagine dal tuo dispositivo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-border">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Profile Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-3xl font-bold text-muted-foreground">
                              {firstName?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="picture">Immagine</Label>
                      <Input
                        id="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annulla</Button>
                    </DialogClose>
                    <Button
                      onClick={saveProfileImage}
                      disabled={!uploadedImage || isSubmitting}
                    >
                      {isSubmitting ? "Salvando..." : "Salva Immagine"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 space-y-4">
              {/* Profile Form */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                  readOnly
                />
                <p className="text-sm text-muted-foreground">
                  L'indirizzo email non può essere modificato
                </p>
              </div>

              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Il tuo username"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        disabled
                        className="bg-muted"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        disabled
                        className="bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUsername(initialUsername || "");
                        setIsEditing(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={!username || isSubmitting}
                    >
                      {isSubmitting ? "Salvando..." : "Salva"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="p-2 border rounded-md bg-background">
                      {username || "Non specificato"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <div className="p-2 border rounded-md bg-background">
                        {firstName || "Non specificato"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome</Label>
                      <div className="p-2 border rounded-md bg-background">
                        {lastName || "Non specificato"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Modifica Profilo
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive/20">
        <CardHeader className="text-destructive">
          <CardTitle>Area Pericolosa</CardTitle>
          <CardDescription>
            Azioni irreversibili sul tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Elimina Account</h4>
                <p className="text-sm text-muted-foreground">
                  Elimina permanentemente il tuo account e tutti i dati
                  associati
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Elimina Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. Eliminerà
                      permanentemente il tuo account e rimuoverà tutti i tuoi
                      dati dai nostri server.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="bg-muted/50 p-3 rounded-md flex items-start gap-3 mt-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        Conseguenze dell'eliminazione:
                      </p>
                      <ul className="list-disc pl-4 pt-2 space-y-1">
                        <li>
                          Perdita di tutti i progressi e i dati di completamento
                        </li>
                        <li>Rimozione di tutti i contenuti personalizzati</li>
                        <li>Impossibilità di recuperare l'account in futuro</li>
                      </ul>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Eliminazione..." : "Elimina Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
