import { notFound } from "next/navigation";
import TopicExercisesPage from "@/app/components/esercizi/exercises-cards-page";
import { Suspense } from "react";
import { ExercisesSkeleton } from "@/app/components/shared/loading";
import { auth } from "@/lib/auth";
import {
  getAllTopics,
  getTopicsWithSubtopics,
  getSubtopicsByTopic,
} from "@/utils/topics-subtopics";
import { getExerciseCardsWithCompletion } from "@/utils/exercise-data";

interface ExercisesTopicPageProps {
  params: Promise<{
    topic: string;
  }>;
  searchParams: Promise<{
    subtopic?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

// Generate static params for all topics - this enables static generation
export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ topic: topic.id }));
}

export default async function ExercisesTopicPage({
  params,
  searchParams,
}: ExercisesTopicPageProps) {
  // Extract the topic ID from params properly
  const { topic: topicId } = await params;
  const { subtopic: subtopicId } = await searchParams;

  return (
    <Suspense fallback={<ExercisesSkeleton />}>
      <ExercisesTopicContent topicId={topicId} subtopicId={subtopicId} />
    </Suspense>
  );
}

async function ExercisesTopicContent({
  topicId,
  subtopicId,
}: {
  topicId: string;
  subtopicId?: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Accesso negato</h2>
        <p>Devi effettuare il login per accedere a questa pagina.</p>
      </div>
    );
  }

  // Get all topics with their subtopics
  const topicsWithSubtopics = await getTopicsWithSubtopics();

  // Find the current topic
  const currentTopic = topicsWithSubtopics.find(
    (topic) => topic.id === topicId
  );

  if (!currentTopic) {
    notFound();
  }

  // Get subtopics for this topic
  const subtopics = await getSubtopicsByTopic(topicId);

  if (!subtopics.length) {
    // No subtopics found for this topic
    return (
      <TopicExercisesPage
        currentTopic={currentTopic}
        topicsWithSubtopics={topicsWithSubtopics}
        subtopicsWithExercises={[]}
        activeSubtopicId={subtopicId}
        userId={userId}
      />
    );
  }

  // Get exercise cards with completion information for all subtopics
  const subtopicIds = subtopics.map((subtopic) => subtopic.id);
  const exerciseCards = await getExerciseCardsWithCompletion(
    subtopicIds,
    userId
  );

  // Group exercise cards by subtopic
  const subtopicsWithExercises = subtopics.map((subtopic) => {
    const cardsForSubtopic = exerciseCards.filter(
      (card) => card.subtopic_id === subtopic.id
    );

    return {
      id: subtopic.id,
      name: subtopic.name,
      order_index: subtopic.order_index,
      topic_id: subtopic.topic_id,
      exercise_cards: cardsForSubtopic.map((card) => ({
        id: card.id,
        subtopic_id: card.subtopic_id,
        description: card.description || "",
        difficulty: card.difficulty,
        is_completed: card.is_completed,
        total_exercises: card.total_exercises,
        completed_exercises: card.completed_exercises,
        is_flagged: card.is_flagged,
      })),
    };
  });

  return (
    <TopicExercisesPage
      currentTopic={currentTopic}
      topicsWithSubtopics={topicsWithSubtopics}
      subtopicsWithExercises={subtopicsWithExercises}
      activeSubtopicId={subtopicId}
      userId={userId}
    />
  );
}
