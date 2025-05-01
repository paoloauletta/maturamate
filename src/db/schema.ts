import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  given_name: text("given_name").notNull(),
  email: text("email").notNull(),
  profile_picture: text("profile_picture").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const topicsTable = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const subtopicsTable = pgTable("subtopics", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic_id: uuid("topic_id")
    .references(() => topicsTable.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const exercisesTable = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  question_data: jsonb("question_data").notNull(),
  solution_data: jsonb("solution_data").notNull(),
  exercise_card_id: uuid("exercise_card_id")
    .references(() => exercisesCardsTable.id)
    .notNull(),
  order_index: integer("order_index"), // Optional order within a topic
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const exercisesCardsTable = pgTable("exercises_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  subtopic_id: uuid("subtopic_id").references(() => subtopicsTable.id),
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull(), // either 1, 2, 3
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const completedExercisesTable = pgTable("completed_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => usersTable.id),
  exercise_id: uuid("exercise_id").references(() => exercisesTable.id),
  is_correct: boolean("is_correct").notNull(),
  attempt: integer("attempt").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const completedExercisesCardsTable = pgTable(
  "completed_exercises_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").references(() => usersTable.id),
    exercise_card_id: uuid("exercise_card_id").references(
      () => exercisesCardsTable.id
    ),
    created_at: timestamp("created_at").notNull().defaultNow(),
  }
);

export const flaggedExercisesTable = pgTable("flagged_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => usersTable.id),
  exercise_id: uuid("exercise_id").references(() => exercisesTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const flaggedExercisesCardsTable = pgTable("flagged_exercises_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => usersTable.id),
  exercise_card_id: uuid("exercise_card_id").references(
    () => exercisesCardsTable.id
  ),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const theoryTable = pgTable("theory", {
  id: uuid("id").primaryKey().defaultRandom(),
  subtopic_id: uuid("subtopic_id").references(() => subtopicsTable.id),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
