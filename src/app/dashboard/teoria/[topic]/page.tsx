import { db } from "@/db/drizzle";
import { topicsTable, subtopicsTable, theoryTable, exercisesCardsTable, exercisesTable, completedExercisesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect, notFound } from "next/navigation";
import TopicClient from "./client";

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
  subtopic_id: string; // This is defined as non-nullable
  title: string;
  content: string; // Changed from unknown to string to match client expectations
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

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: { topic: string };
  searchParams: { subtopic?: string };
}) {
  // Await the params and searchParams
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/api/auth/login");
  }

  const topicId = resolvedParams.topic;
  const subtopicId = resolvedSearchParams.subtopic;

  // Fetch the current topic
  const topic = await db
    .select({
      id: topicsTable.id,
      name: topicsTable.name,
      description: topicsTable.description,
      order_index: topicsTable.order_index,
    })
    .from(topicsTable)
    .where(eq(topicsTable.id, topicId))
    .limit(1);

  if (topic.length === 0) {
    return notFound();
  }

  // Fetch all topics with their subtopics for the sidebar
  const topics = await db
    .select({
      id: topicsTable.id,
      name: topicsTable.name,
      description: topicsTable.description,
      order_index: topicsTable.order_index,
    })
    .from(topicsTable)
    .orderBy(topicsTable.order_index);

  // Fetch all subtopics
  const subtopics = await db
    .select({
      id: subtopicsTable.id,
      topic_id: subtopicsTable.topic_id,
      name: subtopicsTable.name,
      order_index: subtopicsTable.order_index,
    })
    .from(subtopicsTable)
    .orderBy(subtopicsTable.order_index);

  // Fetch all theory content for the current topic
  // Filter out null subtopic_ids to satisfy TypeScript
  const theoryContent = await db
    .select({
      id: theoryTable.id,
      subtopic_id: theoryTable.subtopic_id,
      title: theoryTable.title,
      content: theoryTable.content,
    })
    .from(theoryTable)
    .innerJoin(subtopicsTable, eq(theoryTable.subtopic_id, subtopicsTable.id))
    .where(eq(subtopicsTable.topic_id, topicId))
    .orderBy(subtopicsTable.order_index);

  // Filter out items with null subtopic_id
  const validTheoryContent = theoryContent.filter(
    (item): item is TheoryContentType => item.subtopic_id !== null
  );

  // Build the nested structure for the sidebar - ensure all topics have a subtopics array
  const topicsWithSubtopics = topics.map((t) => ({
    ...t,
    subtopics: subtopics.filter((s) => s.topic_id === t.id),
  }));

  // Fetch all exercise cards for subtopics in this topic
  // Get the subtopic IDs first
  const topicSubtopicIds = subtopics
    .filter(s => s.topic_id === topicId)
    .map(s => s.id);
    
  const exerciseCards = await db
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

  // Get all exercises for the cards we fetched
  const allExercises: { id: string, exercise_card_id: string }[] = [];
  
  // Process in batches to avoid using .in operator which has TypeScript issues
  const cardIds = exerciseCards.map(card => card.id);
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

  // Get completed exercises for this user
  const completedExercises = await db
    .select({
      exercise_id: completedExercisesTable.exercise_id,
      is_correct: completedExercisesTable.is_correct,
    })
    .from(completedExercisesTable)
    .where(eq(completedExercisesTable.user_id, user.id as string));

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
    const completedCount = exercisesForCard.filter(id => 
      correctExercises.has(id)
    ).length;

    acc[card.id] = {
      total_exercises: totalExercises,
      completed_exercises: completedCount,
      is_completed: totalExercises > 0 && completedCount === totalExercises
    };
    
    return acc;
  }, {} as Record<string, { total_exercises: number, completed_exercises: number, is_completed: boolean }>);

  // Format exercise cards with completion info
  const exerciseCardsWithCompletion = exerciseCards.map(card => ({
    ...card,
    ...cardCompletionInfo[card.id] || { total_exercises: 0, completed_exercises: 0, is_completed: false }
  }));

  // Group exercise cards by subtopic for easy access
  const exerciseCardsBySubtopic = exerciseCardsWithCompletion.reduce((acc, card) => {
    if (!card.subtopic_id) return acc;
    
    if (!acc[card.subtopic_id]) {
      acc[card.subtopic_id] = [];
    }
    acc[card.subtopic_id].push(card);
    return acc;
  }, {} as Record<string, ExerciseCardType[]>);

  // Group theory content by subtopic and add exercise cards
  const subtopicsWithTheory: SubtopicWithTheoryType[] = subtopics
    .filter((s) => s.topic_id === topicId)
    .map((s) => ({
      ...s,
      theory: validTheoryContent.filter((t) => t.subtopic_id === s.id),
      exercise_cards: exerciseCardsBySubtopic[s.id] || [],
    }));

  return (
    <TopicClient
      currentTopic={topic[0]}
      topicsWithSubtopics={topicsWithSubtopics}
      subtopicsWithTheory={subtopicsWithTheory}
      activeSubtopicId={subtopicId}
      userId={user.id as string}
    />
  );
}
