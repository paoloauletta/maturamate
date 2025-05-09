import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import TopicClient from "./client";
import {
  getTopicsWithSubtopics,
  getTopics,
  getSubtopics,
  getTheoryContent,
} from "@/utils/cache";
import { db } from "@/db/drizzle";
import {
  exercisesCardsTable,
  exercisesTable,
  completedExercisesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

// Configure for ISR (Incremental Static Regeneration) with shorter revalidation
export const revalidate = 60; // Revalidate every minute to ensure fresh data

// Import dynamicParams for handling routes not listed in generateStaticParams
export const dynamicParams = true; // Allow dynamic routes not captured by generateStaticParams

// Generate static params for all topics - this enables static generation
export async function generateStaticParams() {
  try {
    const topics = await getTopics();
    console.log(
      "Building teoria static paths for topics:",
      topics.map((t) => t.id)
    );

    // Add a test topic for debugging
    return [
      ...topics.map((topic) => ({ topic: topic.id })),
      { topic: "test-topic" },
    ];
  } catch (error) {
    console.error("Error generating static params:", error);
    // Return at least one path to prevent build failures
    return [{ topic: "test-topic" }];
  }
}

// types.ts
export interface TopicType {
  id: string;
  name: string;
  description: string | null;
  order_index: number | null;
}

export interface SubtopicType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
}

export interface TheoryContentType {
  id: string;
  subtopic_id: string;
  title: string;
  content: string;
  created_at?: Date;
}

export interface ExerciseCardType {
  id: string;
  subtopic_id: string | null;
  description: string;
  difficulty: number;
  total_exercises: number;
  completed_exercises: number;
  is_completed: boolean;
}

export interface SubtopicWithTheoryType extends SubtopicType {
  theory: TheoryContentType[];
  exercise_cards: ExerciseCardType[];
}

export interface TopicWithSubtopicsType extends TopicType {
  subtopics: SubtopicType[];
}

export interface TopicClientProps {
  currentTopic: TopicType;
  topicsWithSubtopics: TopicWithSubtopicsType[];
  subtopicsWithTheory: SubtopicWithTheoryType[];
  activeSubtopicId?: string;
  userId: string;
}

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
async function TopicPage(props: any) {
  try {
    // Extract the params and searchParams safely
    const params = await props.params;
    const searchParams = await props.searchParams;
    const topicId = params.topic;
    const subtopicId = searchParams?.subtopic;

    console.log("Rendering teoria page for topic:", topicId);

    if (!topicId) {
      console.log("No topic ID provided, showing 404");
      return notFound();
    }

    const session = await auth();
    const user = session?.user;

    if (!user) {
      console.log("No user found, returning fallback view for topic:", topicId);
      // For test-topic, show a simple page instead of 404
      if (topicId === "test-topic") {
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Test Teoria Page</h1>
            <p>This is a test page for debugging routing issues.</p>
            <p>Topic ID: {topicId}</p>
            <p>Subtopic ID: {subtopicId || "none"}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        );
      }
    }

    // Fetch the current topic and all topics with subtopics using cached functions
    const allTopics = await getTopics();
    const topic = allTopics.filter((t) => t.id === topicId);

    // Handle test topic or missing topic
    if (topic.length === 0) {
      console.log("Topic not found in database, handling specially:", topicId);

      // For test-topic, show a simple page instead of 404
      if (topicId === "test-topic") {
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Test Teoria Page</h1>
            <p>This is a test page for debugging routing issues.</p>
            <p>Topic ID: {topicId}</p>
            <p>Subtopic ID: {subtopicId || "none"}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        );
      }

      return notFound();
    }

    // Get topics with subtopics using the cached function
    const topicsWithSubtopics = await getTopicsWithSubtopics();

    // Get subtopics for this topic using cached function
    const subtopics = await getSubtopics(topicId);

    // Get theory content for all subtopics in this topic
    // Using Promise.all to parallelize requests
    const theoryContentPromises = subtopics.map((subtopic) =>
      getTheoryContent(subtopic.id)
    );
    const theoryContentBySubtopic = await Promise.all(theoryContentPromises);

    // Combine subtopics with their theory content
    const validTheoryContent = theoryContentBySubtopic
      .flat()
      .filter((item) => item.subtopic_id !== null) as TheoryContentType[];

    // Fetch all exercise cards for subtopics in this topic
    // Get the subtopic IDs first
    const topicSubtopicIds = subtopics.map((s) => s.id);

    // Fetch exercise cards - this part might be less cacheable as completion
    // status depends on user progress
    let exerciseCards: {
      id: string;
      subtopic_id: string | null;
      description: string;
      difficulty: number;
    }[] = [];

    if (topicSubtopicIds.length > 0) {
      exerciseCards = await db
        .select({
          id: exercisesCardsTable.id,
          subtopic_id: exercisesCardsTable.subtopic_id,
          description: exercisesCardsTable.description,
          difficulty: exercisesCardsTable.difficulty,
        })
        .from(exercisesCardsTable)
        .where(eq(exercisesCardsTable.subtopic_id, topicSubtopicIds[0]));

      // If there are more subtopics, fetch their exercises too and combine results
      if (topicSubtopicIds.length > 1) {
        for (let i = 1; i < topicSubtopicIds.length; i++) {
          const moreCards = await db
            .select({
              id: exercisesCardsTable.id,
              subtopic_id: exercisesCardsTable.subtopic_id,
              description: exercisesCardsTable.description,
              difficulty: exercisesCardsTable.difficulty,
            })
            .from(exercisesCardsTable)
            .where(eq(exercisesCardsTable.subtopic_id, topicSubtopicIds[i]));

          exerciseCards.push(...moreCards);
        }
      }
    }

    // Get all exercises for the cards we fetched
    const allExercises: { id: string; exercise_card_id: string }[] = [];

    // Process in batches to avoid using .in operator which has TypeScript issues
    const cardIds = exerciseCards.map((card) => card.id);
    for (const cardId of cardIds) {
      const exercises = await db
        .select({
          id: exercisesTable.id,
          exercise_card_id: exercisesTable.exercise_card_id,
        })
        .from(exercisesTable)
        .where(eq(exercisesTable.exercise_card_id, cardId));

      allExercises.push(...exercises);
    }

    // Group exercises by card ID
    const exercisesByCard = allExercises.reduce((acc, exercise) => {
      if (!exercise.exercise_card_id) return acc;

      if (!acc[exercise.exercise_card_id]) {
        acc[exercise.exercise_card_id] = [];
      }
      acc[exercise.exercise_card_id].push(exercise.id);
      return acc;
    }, {} as Record<string, string[]>);

    // This part is user-specific and cannot be cached
    // Get completed exercises for this user
    const completedExercises = await db
      .select({
        exercise_id: completedExercisesTable.exercise_id,
        is_correct: completedExercisesTable.is_correct,
      })
      .from(completedExercisesTable)
      .where(eq(completedExercisesTable.user_id, user?.id as string));

    // Filter to only correct exercises and create a set for faster lookups
    const correctExercises = new Set(
      completedExercises
        .filter((ex) => ex.is_correct && ex.exercise_id)
        .map((ex) => ex.exercise_id)
    );

    // Calculate completion for each card
    const cardCompletionInfo = exerciseCards.reduce((acc, card) => {
      const exercisesForCard = exercisesByCard[card.id] || [];
      const totalExercises = exercisesForCard.length;
      const completedCount = exercisesForCard.filter((id) =>
        correctExercises.has(id)
      ).length;

      acc[card.id] = {
        total_exercises: totalExercises,
        completed_exercises: completedCount,
        is_completed: totalExercises > 0 && completedCount === totalExercises,
      };

      return acc;
    }, {} as Record<string, { total_exercises: number; completed_exercises: number; is_completed: boolean }>);

    // Format exercise cards with completion info
    const exerciseCardsWithCompletion = exerciseCards.map((card) => ({
      ...card,
      ...(cardCompletionInfo[card.id] || {
        total_exercises: 0,
        completed_exercises: 0,
        is_completed: false,
      }),
    }));

    // Group exercise cards by subtopic for easy access
    const exerciseCardsBySubtopic = exerciseCardsWithCompletion.reduce(
      (acc, card) => {
        if (!card.subtopic_id) return acc;

        if (!acc[card.subtopic_id]) {
          acc[card.subtopic_id] = [];
        }
        acc[card.subtopic_id].push(card);
        return acc;
      },
      {} as Record<string, ExerciseCardType[]>
    );

    // Group theory content by subtopic and add exercise cards
    const subtopicsWithTheory: SubtopicWithTheoryType[] = subtopics.map(
      (s) => ({
        ...s,
        theory: validTheoryContent.filter((t) => t.subtopic_id === s.id),
        exercise_cards: exerciseCardsBySubtopic[s.id] || [],
      })
    );

    return (
      <div className="">
        <TopicClient
          currentTopic={topic[0]}
          topicsWithSubtopics={topicsWithSubtopics}
          subtopicsWithTheory={subtopicsWithTheory}
          activeSubtopicId={subtopicId}
          userId={user?.id as string}
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering topic page:", error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Error Loading Topic</h1>
        <p>There was an error loading this topic. Please try again later.</p>
        <pre className="bg-gray-100 p-4 mt-4 rounded text-sm overflow-auto">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </div>
    );
  }
}

// Export with the 'any' type to bypass Next.js type constraints
export default TopicPage;
