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

export const simulationsTable = pgTable("simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pdf_url: text("pdf_url").notNull(),
  year: integer("year").notNull(),
  subject: text("subject").notNull(),
  time_in_min: integer("time_in_min").notNull(),
  is_complete: boolean("is_complete").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const simulationsSolutionsTable = pgTable("simulations_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
  title: text("title").notNull(),
  pdf_url: text("pdf_url").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const simulationsExercisesTable = pgTable("simulations_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
  title: text("title").notNull(),
  question_data: jsonb("question_data").notNull(),
  solution_data: jsonb("solution_data").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const completedSimulationsTable = pgTable("completed_simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull(),
  simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
  attempt: integer("attempt").notNull(),
  started_at: timestamp("started_at").notNull().defaultNow(),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
