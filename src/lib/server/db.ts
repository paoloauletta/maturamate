/**
 * Server Database Utilities
 *
 * Centralized database access functions with consistent caching.
 * Use these utilities in all server components to ensure consistent
 * data fetching patterns and proper caching.
 */

import { cache } from "react";
import { db } from "@/db/drizzle";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users, exercisesTable, completedExercisesTable } from "@/db/schema";

/**
 * Generic cached query function
 * Wraps any database query with React's cache function
 */
export function cachedQuery<T>(queryFn: () => Promise<T>) {
  return cache(queryFn);
}

/**
 * Cached fetch function for external API calls
 */
export const cachedFetch = cache(async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    next: { revalidate: 3600 }, // Default 1-hour cache
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from ${url}: ${res.statusText}`);
  }

  return res.json();
});

/**
 * Data invalidation utility
 * Use this when mutating data to invalidate caches
 */
export function invalidateData(path: string = "/") {
  revalidatePath(path);
}

// Common database queries with caching
// These should be used instead of direct db queries

/**
 * Get user by ID with caching
 */
export const getUserById = cache(async (userId: string) => {
  const result = await db.select().from(users).where(eq(users.id, userId));

  return result[0];
});

/**
 * Get user exercises with caching
 */
export const getUserExercises = cache(async (userId: string) => {
  const exercises = await db
    .select()
    .from(exercisesTable)
    .innerJoin(
      completedExercisesTable,
      eq(completedExercisesTable.exercise_id, exercisesTable.id)
    )
    .where(eq(completedExercisesTable.user_id, userId))
    .orderBy(exercisesTable.created_at);

  return exercises;
});

/**
 * Get exercises by topic with caching
 */
export const getExercisesByTopic = cache(async (topicId: string) => {
  // Assuming there's a relationship between exercises and topics
  // via subtopics and exercise cards
  const exercises = await db
    .select()
    .from(exercisesTable)
    .where(
      eq(
        sql`${exercisesTable.id}`,
        sql`
        SELECT e.id 
        FROM exercises e
        JOIN exercises_cards ec ON e.exercise_card_id = ec.id
        JOIN subtopics s ON ec.subtopic_id = s.id
        WHERE s.topic_id = ${topicId}
      `
      )
    )
    .orderBy(exercisesTable.created_at);

  return exercises;
});

/**
 * Get user statistics with caching
 */
export const getUserStatistics = cache(async (userId: string) => {
  // Get completed exercises count
  const exercisesStats = await db
    .select({
      total: sql<number>`COUNT(DISTINCT ${exercisesTable.id})`,
      completed: sql<number>`COUNT(DISTINCT CASE WHEN ${completedExercisesTable.id} IS NOT NULL THEN ${exercisesTable.id} END)`,
      correct: sql<number>`COUNT(DISTINCT CASE WHEN ${completedExercisesTable.is_correct} = true THEN ${exercisesTable.id} END)`,
    })
    .from(exercisesTable)
    .leftJoin(
      completedExercisesTable,
      and(
        eq(completedExercisesTable.exercise_id, exercisesTable.id),
        eq(completedExercisesTable.user_id, userId)
      )
    );

  return exercisesStats[0];
});

/**
 * Update or create user data
 * Note: This function is not cached and invalidates relevant paths
 */
export async function updateUserData(userId: string, data: any) {
  // Implementation depends on your schema and requirements
  // This is a placeholder

  // After updating, invalidate relevant cache paths
  invalidateData(`/dashboard`);
  invalidateData(`/dashboard/statistiche`);

  return { success: true };
}
