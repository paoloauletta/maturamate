import { Skeleton } from "@/components/ui/skeleton";

export function ExercisesLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-border">
        <Skeleton className="h-10 w-90" /> {/* "Esercizi" heading */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" /> {/* Filter button */}
        </div>
      </div>

      {/* Content Section with Sidebar on the Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Exercise Cards Skeleton (Main Content) */}
        <div className="md:col-span-9 pr-8 ">
          <div className="space-y-10">
            {Array.from({ length: 2 }).map((_, topicIndex) => (
              <div key={topicIndex} className="space-y-8">
                <Skeleton className="h-9 w-64 rounded-md" />{" "}
                {/* Subtopic Sections */}
                {Array.from({ length: 2 }).map((_, subtopicIndex) => (
                  <div key={subtopicIndex} className="space-y-4 mb-6 ">
                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, cardIndex) => (
                        <div
                          key={cardIndex}
                          className="rounded-lg border h-[180px] bg-card/50"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Topics Sidebar Skeleton */}
        <div className="md:col-span-3 border-l border-border">
          <div className="bg-card/50 rounded-lg p-4 sticky top-20">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <Skeleton className="h-7 w-[50%] rounded-md" />{" "}
                  {/* Topic name */}
                  <div className="pl-4 space-y-2">
                    {Array.from({ length: i === 0 ? 4 : 3 }).map((_, j) => {
                      return (
                        <Skeleton key={j} className="h-6 w-[48%] rounded-md" />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
