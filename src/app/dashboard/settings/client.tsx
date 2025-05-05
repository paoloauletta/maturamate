"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Upload, Trash2, X, AlertCircle, LogOut } from "lucide-react";
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
import { useSession, signOut } from "next-auth/react";

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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-10">
      {/* Sign Out Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Disconnetti
        </Button>
      </div>

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
                      {fullName?.charAt(0) || "U"}
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
                              {fullName?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-image">Immagine Profilo</Label>
                      <Input
                        id="profile-image"
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
                      {isSubmitting ? "Caricamento..." : "Salva"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  La tua email non può essere modificata
                </p>
              </div>

              {!isEditing ? (
                <>
                  <div className="space-y-1">
                    <Label>Nome Completo</Label>
                    <div className="flex items-center justify-between">
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

                  <div className="space-y-1">
                    <Label>Username</Label>
                    <div className="flex items-center justify-between">
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
                  <div className="space-y-1">
                    <Label htmlFor="full-name">Nome Completo</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Il tuo nome completo"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Il tuo username"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
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

      {/* Delete Account Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Elimina Account</CardTitle>
          <CardDescription>
            Elimina permanentemente il tuo account e tutti i dati associati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Elimina Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Eliminerà
                  permanentemente il tuo account e rimuoverà i tuoi dati dai
                  nostri server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isSubmitting ? "Eliminazione..." : "Elimina Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
