import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  is_active: integer("is_active").default(1),
  is_premium: integer("is_premium").default(0),
  created_at: timestamp("created_at").defaultNow()
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: jsonb("content").notNull(),
  confidence: integer("confidence").default(0),
  user_id: integer("user_id").notNull(), // reference via app logic (foreign key optional)
  created_at: timestamp("created_at").defaultNow()
});

export const api_usages = pgTable("api_usages", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  endpoint: text("endpoint"),
  tokens_used: integer("tokens_used").default(0),
  cost: integer("cost").default(0),
  created_at: timestamp("created_at").defaultNow()
});
