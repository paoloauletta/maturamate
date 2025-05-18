"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/app/components/shared/loading/loading-spinner";
import TheoryHeader from "./TheoryHeader";
import TheorySubtopic from "./TheorySubtopic";
import TheoryNextTopic from "./TheoryNextTopic";
import TheorySidebar from "./TheorySidebar";
import { useTheoryContext } from "./TheoryContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  TopicType,
  SubtopicWithTheoryType,
  TopicWithSubtopicsType,
} from "@/types/theoryTypes";

interface TheoryContentProps {
  currentTopic: TopicType;
  subtopicsWithTheory: SubtopicWithTheoryType[];
  topicsWithSubtopics: TopicWithSubtopicsType[];
  userId: string;
}

export default function TheoryContent({
  currentTopic,
  subtopicsWithTheory,
  topicsWithSubtopics,
  userId,
}: TheoryContentProps) {
  const searchParams = useSearchParams();
  const initialActiveSubtopicId = searchParams.get("subtopic") || undefined;
  const subtopicRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { updateViewedSubtopic } = useTheoryContext();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isMobile, mounted } = useIsMobile();

  // When the active subtopic changes, scroll to that element
  // We'll only perform scrolling for direct URL access, not for sidebar clicks
  useEffect(() => {
    // We only want this to run on initial page load, not on subsequent subtopic changes
    // This is important to avoid double scrolling when clicking from the sidebar
    if (
      initialActiveSubtopicId &&
      subtopicRefs.current[initialActiveSubtopicId] &&
      // Check for a flag in sessionStorage to determine if this is a direct URL access
      !sessionStorage.getItem("sidebar_navigation")
    ) {
      requestAnimationFrame(() => {
        const targetElement = subtopicRefs.current[initialActiveSubtopicId];
        if (!targetElement) return;

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    // Clear the flag after initial page load
    return () => {
      sessionStorage.removeItem("sidebar_navigation");
    };
  }, [initialActiveSubtopicId]);

  // Set up Intersection Observer to track which subtopic is currently in view
  useEffect(() => {
    // Initialize observer with options
    const options = {
      root: null, // viewport
      rootMargin: "-100px 0px -65% 0px", // top, right, bottom, left
      threshold: [0, 0.1, 0.2, 0.3], // trigger at multiple thresholds for smoother transitions
    };

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver((entries) => {
      // Sort entries by their position in the viewport and intersection ratio
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          // First try to sort by how visible they are (higher intersection ratio first)
          if (Math.abs(a.intersectionRatio - b.intersectionRatio) > 0.1) {
            return b.intersectionRatio - a.intersectionRatio;
          }
          // If visibility is similar, prefer the element closest to the top
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });

      // Get the first (most visible or closest to top) entry
      const topEntry = visibleEntries[0];

      if (topEntry) {
        const subtopicId = topEntry.target.id;
        if (subtopicId) {
          updateViewedSubtopic(subtopicId);
        }
      }
    }, options);

    // Observe all subtopic elements
    Object.values(subtopicRefs.current).forEach((element) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [subtopicsWithTheory, updateViewedSubtopic]);

  // Handle scrolling tracking for the sidebar's progress indicators
  useEffect(() => {
    const handleScroll = () => {
      // Scroll tracking logic would go here, but is now handled in the context
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track refs for subtopics to enable scrolling
  const handleSubtopicRef = (id: string, element: HTMLDivElement | null) => {
    subtopicRefs.current[id] = element;

    // Add the element to the observer if it exists and observer is initialized
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Caricamento teoria..." />;
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto px-4 sm:px-6">
      {/* Mobile Topic Menu - Show above topic name on mobile */}
      <div className="block lg:hidden mb-4">
        <TheorySidebar isMobile={true} />
      </div>

      <TheoryHeader topic={currentTopic}>
        {/* You can add filter controls here if needed */}
      </TheoryHeader>

      <div className="flex flex-col md:flex-row gap-4 lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-12">
          {subtopicsWithTheory.length > 0 ? (
            subtopicsWithTheory.map((subtopic, index) => (
              <TheorySubtopic
                key={subtopic.id}
                topic={currentTopic}
                subtopic={subtopic}
                index={index}
                onRef={handleSubtopicRef}
              />
            ))
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-lg p-6">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Non ci sono ancora contenuti teorici per questo argomento.
              </p>
            </div>
          )}

          <TheoryNextTopic
            currentTopic={currentTopic}
            topicsWithSubtopics={topicsWithSubtopics}
          />
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block lg:w-1/3 xl:w-1/4 flex-shrink-0 pl-4 border-l border-muted">
          <div className="sticky top-8 pt-4">
            <TheorySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
