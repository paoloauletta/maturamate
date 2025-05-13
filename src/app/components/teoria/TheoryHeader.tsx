"use client";

import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheoryContext } from "./TheoryContext";
import { TopicType } from "@/types/theoryTypes";

interface TheoryHeaderProps {
  topic: TopicType;
}

export default function TheoryHeader({ topic }: TheoryHeaderProps) {
  const { completedTopicIds } = useTheoryContext();
  const isCompleted = completedTopicIds.includes(topic.id);

  return (
    <div className="flex justify-between items-center lg:mt-0 lg:mb-8 lg:pb-4 border-b border-border mb-6 pb-2">
      <h1 className="md:text-5xl text-4xl font-semibold text-left text-primary">
        {topic.name}
        {isCompleted && (
          <CheckCircle className="inline-block ml-2 h-6 w-6 text-green-500" />
        )}
      </h1>
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
  );
}
