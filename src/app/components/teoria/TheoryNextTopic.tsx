"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useTheoryContext } from "./TheoryContext";
import { TopicType, TopicWithSubtopicsType } from "@/types/theoryTypes";
import { toast } from "sonner";

interface TheoryNextTopicProps {
  currentTopic: TopicType;
  topicsWithSubtopics: TopicWithSubtopicsType[];
}

export default function TheoryNextTopic({
  currentTopic,
  topicsWithSubtopics,
}: TheoryNextTopicProps) {
  const router = useRouter();
  const { updateCompletedTopic } = useTheoryContext();
  const [isLoading, setIsLoading] = useState(false);

  // Find the next topic
  const findNextTopic = () => {
    // If currentTopic doesn't have an order_index, return the first topic
    if (currentTopic.order_index === null) {
      return topicsWithSubtopics[0]?.id;
    }

    // Sort topics by order_index
    const sortedTopics = [...topicsWithSubtopics].sort((a, b) => {
      if (a.order_index === null) return 1;
      if (b.order_index === null) return -1;
      return a.order_index - b.order_index;
    });

    // Find the index of the current topic
    const currentIndex = sortedTopics.findIndex(
      (t) => t.id === currentTopic.id
    );

    // Return the next topic, or the first one if we're at the end
    if (currentIndex < sortedTopics.length - 1) {
      return sortedTopics[currentIndex + 1].id;
    }

    return null; // No next topic available (we're at the last one)
  };

  const nextTopicId = findNextTopic();

  // If there's no next topic, don't render the button
  if (!nextTopicId) {
    return null;
  }

  // Handle click on "Vai al prossimo argomento" button
  const handleNextTopicClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/topics/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic_id: currentTopic.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the topic completion status in context
        updateCompletedTopic(currentTopic.id);

        // Navigate to the next topic
        router.push(`/dashboard/teoria/${nextTopicId}`);
        toast.success("Argomento completato con successo!");
      } else {
        console.error("Error response:", data);
        toast.error(
          data.error || "Errore nel salvare il completamento dell'argomento"
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error marking topic as completed:", error);
      toast.error("Errore nel salvare il completamento dell'argomento");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-8 border-t border-muted mt-12">
      <Button
        className="group px-8 py-6 text-white cursor-pointer"
        variant="default"
        size="lg"
        onClick={handleNextTopicClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <span>Caricamento...</span>
        ) : (
          <>
            <span>Vai al prossimo argomento</span>
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
}
