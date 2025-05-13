"use client";

import { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TheoryProvider } from "./TheoryContext";
import TheorySidebar from "./TheorySidebar";
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
      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-3/4 space-y-8 md:border-r md:border-muted md:pr-8">
          {children}
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden md:block md:w-1/4 relative">
          <TheorySidebar />
        </div>

        {/* Mobile Topic Menu - Show above topic name on mobile */}
        <div className="block md:hidden">
          <TheorySidebar isMobile={true} />
        </div>
      </div>
    </TheoryProvider>
  );
}
