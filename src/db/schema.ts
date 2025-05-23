import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  primaryKey,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const waitingList = pgTable("waiting_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  unsubscribed: boolean("unsubscribed").default(false),
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username"),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const topicsTable = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  slug: text("slug").notNull(),
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
  slug: text("slug").notNull(),
});

export const completedTopicsTable = pgTable("completed_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
  topic_id: uuid("topic_id").references(() => topicsTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const completedSubtopicsTable = pgTable("completed_subtopics", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
  subtopic_id: uuid("subtopic_id").references(() => subtopicsTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const exercisesTable = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  question_data: jsonb("question_data").notNull(),
  solution_data: jsonb("solution_data").notNull(),
  exercise_card_id: uuid("exercise_card_id")
    .references(() => exercisesCardsTable.id)
    .notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const exercisesCardsTable = pgTable("exercises_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  subtopic_id: uuid("subtopic_id").references(() => subtopicsTable.id),
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull(), // either 1, 2, 3
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  slug: text("slug").notNull(),
});

export const completedExercisesTable = pgTable("completed_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
  exercise_id: uuid("exercise_id").references(() => exercisesTable.id),
  is_correct: boolean("is_correct").notNull(),
  attempt: integer("attempt").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const completedExercisesCardsTable = pgTable(
  "completed_exercises_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").references(() => users.id),
    exercise_card_id: uuid("exercise_card_id").references(
      () => exercisesCardsTable.id
    ),
    created_at: timestamp("created_at").notNull().defaultNow(),
  }
);

export const flaggedExercisesTable = pgTable("flagged_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
  exercise_id: uuid("exercise_id").references(() => exercisesTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const flaggedExercisesCardsTable = pgTable("flagged_exercises_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
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

export const simulationsCardsTable = pgTable("simulations_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  subject: text("subject").notNull(),
  order_index: integer("order_index"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const simulationsTable = pgTable("simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  card_id: uuid("card_id")
    .notNull()
    .references(() => simulationsCardsTable.id),
  pdf_url: text("pdf_url").notNull(),
  time_in_min: integer("time_in_min").notNull(),
  is_complete: boolean("is_complete").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  slug: text("slug").notNull(),
});

export const simulationsSolutionsTable = pgTable("simulations_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  pdf_url: text("pdf_url").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const relationSimulationSolutionTable = pgTable(
  "relation_simulations_solutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
    solution_id: uuid("solution_id").references(
      () => simulationsSolutionsTable.id
    ),
    order_index: integer("order_index").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  }
);

export const completedSimulationsTable = pgTable("completed_simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull(),
  simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
  attempt: integer("attempt").notNull(),
  started_at: timestamp("started_at").notNull().defaultNow(),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const flaggedSimulationsTable = pgTable("flagged_simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => users.id),
  simulation_id: uuid("simulation_id").references(() => simulationsTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
