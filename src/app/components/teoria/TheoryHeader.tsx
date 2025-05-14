"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheoryContext } from "./TheoryContext";
import { TopicType } from "@/types/theoryTypes";

interface TheoryHeaderProps {
  topic: TopicType;
  children?: React.ReactNode;
}

export default function TheoryHeader({ topic, children }: TheoryHeaderProps) {
  const { completedTopicIds } = useTheoryContext();
  const isCompleted = completedTopicIds.includes(topic.id);

  return (
    <div className="mb-6">
      <Link href="/dashboard/teoria">
        <div className="text-muted-foreground items-center w-fit gap-1 mb-1 flex flex-row hover:text-foreground transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span>Torna agli argomenti</span>
        </div>
      </Link>

      <div className="flex flex-col gap-2 mb-6 pb-4 border-b border-muted">
        <div className="flex items-center justify-between">
          <h1 className="lg:text-4xl text-2xl font-bold">
            {topic.name}
            {isCompleted && (
              <CheckCircle className="inline-block ml-2 h-6 w-6 text-green-500" />
            )}
          </h1>

          <div className="flex items-center gap-3">
            {children}

            <Link
              href={`/dashboard/esercizi/${topic.id}`}
              className="hidden md:block"
            >
              <Button
                className="flex items-center gap-2 cursor-pointer"
                variant="outline"
              >
                <BookOpen className="h-4 w-4" />
                Esercitati su questo argomento
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
