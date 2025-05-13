import TheoryContent from "@/app/components/teoria/TheoryContent";
import { auth } from "@/lib/auth";
import {
  getTopicsWithSubtopics,
  getAllTopics,
  getSubtopicsByTopic,
} from "@/utils/topics-subtopics";
import { getTheoryContent } from "@/utils/theory";
import {
  getExerciseCardsWithCompletion,
  groupExerciseCardsBySubtopic,
} from "@/utils/exercise-data";
import { SubtopicWithTheoryType } from "@/types/theoryTypes";
import { TopicType, TopicWithSubtopicsType } from "@/types/topicsTypes";

// Configure for ISR (Incremental Static Regeneration) with shorter revalidation
export const revalidate = 60; // Revalidate every minute to ensure fresh data

// Import dynamicParams for handling routes not listed in generateStaticParams
export const dynamicParams = true; // Allow dynamic routes not captured by generateStaticParams

interface PageProps {
  params: Promise<{
    topic: string;
  }>;
}

async function getTopicPageData(topicId: string) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    // 1. Fetch all topics and find the current one
    const allTopics = await getAllTopics();
    const currentTopic = allTopics.find((t) => t.id === topicId);

    if (!currentTopic) {
      throw new Error(`Topic with ID ${topicId} not found`);
    }

    // 2. Get topics with subtopics for navigation
    const topicsWithSubtopics = await getTopicsWithSubtopics();

    // 3. Get subtopics for the current topic
    const allSubtopics = await getSubtopicsByTopic(topicId);

    // 4. Get theory content for all subtopics
    const theoryContentPromises = allSubtopics.map((subtopic) =>
      getTheoryContent(subtopic.id)
    );
    const theoryContentBySubtopic = await Promise.all(theoryContentPromises);

    // 5. Filter out null subtopic_ids in theory content
    const validTheoryContent = theoryContentBySubtopic
      .flat()
      .filter((item) => item.subtopic_id !== null);

    // 6. Get all subtopic IDs for exercise fetching
    const subtopicIds = allSubtopics.map((s) => s.id);

    // 7. Get exercise cards with completion information
    const exerciseCardsWithCompletion = await getExerciseCardsWithCompletion(
      subtopicIds,
      user.id
    );

    // 8. Group exercise cards by subtopic
    const exerciseCardsBySubtopic = groupExerciseCardsBySubtopic(
      exerciseCardsWithCompletion
    );

    // 9. Combine subtopics with theory content and exercise cards
    const subtopicsWithTheory = allSubtopics.map((s) => ({
      ...s,
      theory: validTheoryContent.filter((t) => t.subtopic_id === s.id),
      exercise_cards: exerciseCardsBySubtopic[s.id] || [],
    })) as SubtopicWithTheoryType[];

    // Return all the data needed for the page
    return {
      currentTopic: currentTopic as TopicType,
      topicsWithSubtopics: topicsWithSubtopics as TopicWithSubtopicsType[],
      subtopicsWithTheory,
      userId: user.id,
    };
  } catch (error) {
    console.error("Error fetching topic data:", error);
    throw error;
  }
}

export default async function TopicPage({ params }: PageProps) {
  // Extract the topic ID from params properly
  const { topic: topicId } = await params;

  // Fetch all the data using the server action
  const data = await getTopicPageData(topicId);

  // Render the TheoryContent component with the fetched data
  return (
    <TheoryContent
      currentTopic={data.currentTopic}
      topicsWithSubtopics={data.topicsWithSubtopics}
      subtopicsWithTheory={data.subtopicsWithTheory}
      userId={data.userId}
    />
  );
}
