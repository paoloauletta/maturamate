import { cache } from "react";
import { db } from "@/db/drizzle";
import { theoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Cache theory content for a subtopic
export const getTheoryContent = cache(async (subtopicId: string) => {
  return db
    .select()
    .from(theoryTable)
    .where(eq(theoryTable.subtopic_id, subtopicId));
});
