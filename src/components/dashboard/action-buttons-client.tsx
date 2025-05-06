"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Book, BookOpen, ClipboardCheck, Bot } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  buttonText: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
}: ActionCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Icon className="h-8 w-8 mb-2 text-primary" />
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface DashboardActionsProps {
  continueUrl: string;
  weakestTopic: string;
}

export function DashboardActions({
  continueUrl,
  weakestTopic,
}: DashboardActionsProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
      <ActionCard
        title="Continua lo studio"
        description="Riprendi da dove avevi interrotto con il materiale teorico."
        icon={Book}
        href={continueUrl}
        buttonText="Continua"
      />

      <ActionCard
        title="Esercitati ora"
        description="Metti alla prova le tue conoscenze con gli esercizi disponibili."
        icon={BookOpen}
        href="/dashboard/esercizi"
        buttonText="Esercitati"
      />

      <ActionCard
        title="Fai una simulazione"
        description="Simula una prova d'esame completa per prepararti al meglio."
        icon={ClipboardCheck}
        href="/dashboard/simulazioni"
        buttonText="Inizia"
      />

      <ActionCard
        title="Chiedi al tutor"
        description={`Hai dubbi su ${weakestTopic}? Chiedi aiuto al tutor virtuale.`}
        icon={Bot}
        href="/dashboard/tutor"
        buttonText="Chatta ora"
      />
    </section>
  );
}
