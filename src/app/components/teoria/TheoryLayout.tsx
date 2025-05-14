"use client";

import { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TheoryProvider } from "./TheoryContext";
import { SidebarTopicType } from "@/types/theoryTypes";

interface TheoryLayoutProps {
  children: ReactNode;
  topics: SidebarTopicType[];
  initialCompletedTopics: string[];
  initialCompletedSubtopics: string[];
}

export default function TheoryLayout({
  children,
  topics,
  initialCompletedTopics,
  initialCompletedSubtopics,
}: TheoryLayoutProps) {
  // Extract active topic ID from the URL path
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const activeTopicId = pathSegments[pathSegments.length - 1];

  // Extract active subtopic ID from the search params
  const searchParams = useSearchParams();
  const activeSubtopicId = searchParams.get("subtopic") || undefined;

  return (
    <TheoryProvider
      topics={topics}
      initialCompletedTopics={initialCompletedTopics}
      initialCompletedSubtopics={initialCompletedSubtopics}
      activeTopicId={activeTopicId}
      activeSubtopicId={activeSubtopicId}
    >
      {children}
    </TheoryProvider>
  );
}
