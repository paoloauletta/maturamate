import { getTopicData } from "./topic-data-server";
import ExercisesTopicClient from "./client";
import { getTopics } from "@/utils/cache";

// Set revalidation period - revalidate every hour
export const revalidate = 3600;

// Generate static params for all topics - this enables static generation
export async function generateStaticParams() {
  const topics = await getTopics();
  return topics.map((topic) => ({ topic: topic.id }));
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

export interface ExerciseCardType {
  id: string;
  subtopic_id: string | null;
  description: string;
  difficulty: number;
  order_index: number | null;
  total_exercises: number;
  completed_exercises: number;
  is_completed: boolean;
}

export interface SubtopicWithExercisesType extends SubtopicType {
  exercise_cards: ExerciseCardType[];
}

export interface TopicWithSubtopicsType extends TopicType {
  subtopics: SubtopicType[];
}

export interface ExerciseTopicClientProps {
  currentTopic: TopicType;
  topicsWithSubtopics: TopicWithSubtopicsType[];
  subtopicsWithExercises: SubtopicWithExercisesType[];
  activeSubtopicId?: string;
  userId: string;
}

// Using the `any` type to bypass the specific Next.js constraint
// This is a last resort solution when type errors persist
export default async function ExercisesTopicPage(props: any) {
  // Properly await the params
  const params = await props.params;
  const searchParams = await props.searchParams;

  const topicId = params.topic;
  const subtopicId = searchParams?.subtopic;

  const topicData = await getTopicData(topicId, subtopicId);

  return (
    <ExercisesTopicClient
      currentTopic={topicData.currentTopic}
      topicsWithSubtopics={topicData.topicsWithSubtopics}
      subtopicsWithExercises={topicData.subtopicsWithExercises}
      activeSubtopicId={topicData.activeSubtopicId}
      userId={topicData.userId}
    />
  );
}
