"use client";

import { useRef, useState } from "react";
import { Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheoryContext } from "./TheoryContext";
import MarkdownRenderer from "@/app/components/shared/renderer/markdown-renderer";
import TheoryExerciseCards from "./TheoryExerciseCards";
import {
  SubtopicWithTheoryType,
  TopicType,
  TheoryContentType,
} from "@/types/theoryTypes";
import { toast } from "sonner";

interface TheorySubtopicProps {
  topic: TopicType;
  subtopic: SubtopicWithTheoryType;
  index: number;
  onRef: (id: string, element: HTMLDivElement | null) => void;
}

export default function TheorySubtopic({
  topic,
  subtopic,
  index,
  onRef,
}: TheorySubtopicProps) {
  const { completedSubtopicIds, updateCompletedSubtopic } = useTheoryContext();
  const isCompleted = completedSubtopicIds.includes(subtopic.id);
  const [isLoading, setIsLoading] = useState(false);

  // Handle marking subtopic as completed
  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subtopics/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subtopic_id: subtopic.id }),
      });

      const data = await response.json();

      if (response.ok) {
        updateCompletedSubtopic(subtopic.id);
        toast.success("Sottotopico completato con successo!");
      } else {
        console.error("Error response:", data);
        toast.error(
          data.error || "Errore nel salvare il completamento del sottotopico"
        );
      }
    } catch (error) {
      console.error("Error marking subtopic as completed:", error);
      toast.error("Errore nel salvare il completamento del sottotopico");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse content if needed
  const parseContent = (content: string | any): any => {
    if (typeof content === "string") {
      // Try to parse JSON string if it looks like JSON
      if (content.startsWith("[") && content.endsWith("]")) {
        try {
          return JSON.parse(content);
        } catch (e) {
          return content;
        }
      }
      return content;
    }
    return content;
  };

  return (
    <div
      ref={(el) => onRef(subtopic.id, el)}
      id={subtopic.id}
      className="scroll-mt-16"
    >
      {/* Add divider between subtopics except for the first one */}
      {index > 0 && (
        <div className="my-10 border-t border-gray-200 dark:border-gray-800" />
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="md:text-3xl text-2xl font-semibold text-foreground/95">
            {subtopic.order_index !== null ? `${subtopic.order_index}. ` : ""}
            <span>{subtopic.name}</span>
            {isCompleted && (
              <CheckCircle className="inline-block ml-2 h-5 w-5 text-green-500" />
            )}
          </h2>
        </div>

        {subtopic.theory.length > 0 ? (
          <div className="mt-6">
            {/* Theory content */}
            {subtopic.theory.map((theory: TheoryContentType) => (
              <div key={theory.id} className="space-y-4">
                <div className="prose max-w-full dark:prose-invert overflow-x-auto">
                  <MarkdownRenderer
                    content={parseContent(theory.content)}
                    className="theory-content prose-headings:mt-6 prose-headings:mb-4 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 w-full"
                  />
                </div>
              </div>
            ))}

            {/* Mark Subtopic as Completed Button */}
            <div className="flex lg:justify-end my-8 justify-center">
              <Button
                variant={isCompleted ? "outline" : "default"}
                size="sm"
                onClick={handleMarkAsCompleted}
                disabled={isLoading || isCompleted}
                className={isCompleted ? "text-green-500 border-green-500" : ""}
              >
                {isLoading ? (
                  <>Caricamento...</>
                ) : isCompleted ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Completato
                  </>
                ) : (
                  <div className="flex gap-1 items-center cursor-pointer text-white">
                    <Check className="h-4 w-4 mr-1" />
                    Segna come completato
                  </div>
                )}
              </Button>
            </div>

            {/* Exercise Cards */}
            <TheoryExerciseCards topic={topic} subtopic={subtopic} />
          </div>
        ) : (
          <p className="text-muted-foreground">
            Non ci sono ancora contenuti teorici per questo argomento.
          </p>
        )}
      </div>
    </div>
  );
}
