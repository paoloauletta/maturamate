"use client";

import TopicsSidebar from "@/app/components/dashboard/topics-sidebar";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface SubtopicType {
  id: string;
  name: string;
  order_index: number | null;
}

interface TopicType {
  id: string;
  name: string;
  order_index: number | null;
  subtopics: SubtopicType[];
}

interface ClientTheoryPageProps {
  topicsWithSubtopics: TopicType[];
}

export default function ClientTheoryPage({
  topicsWithSubtopics,
}: ClientTheoryPageProps) {
  const router = useRouter();

  // Handle navigation when clicking on a topic
  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/teoria/${topicId}`);
  };

  // Handle navigation when clicking on a subtopic
  const handleSubtopicClick = (subtopicId: string, topicId: string) => {
    router.push(`/dashboard/teoria/${topicId}?subtopic=${subtopicId}`);
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8 text-center">Teoria</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <TopicsSidebar
            topics={topicsWithSubtopics}
            activeTopicId={undefined}
            activeSubtopicId={undefined}
            onTopicClick={handleTopicClick}
            onSubtopicClick={(subtopicId) => {
              // Find the topic that contains this subtopic
              const topic = topicsWithSubtopics.find((t) =>
                t.subtopics.some((s) => s.id === subtopicId)
              );
              if (topic) {
                handleSubtopicClick(subtopicId, topic.id);
              }
            }}
          />
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:border-r lg:border-muted lg:pr-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicsWithSubtopics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:ring-1 hover:ring-blue-600 transition-all"
                onClick={() => handleTopicClick(topic.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {topic.order_index !== null && (
                      <span>{topic.order_index}.</span>
                    )}
                    {topic.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {topic.subtopics.length}{" "}
                    {topic.subtopics.length === 1 ? "argomento" : "argomenti"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
