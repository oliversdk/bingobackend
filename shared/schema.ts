import { pgTable, text, integer, decimal, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userStatusEnum = pgEnum('user_status', ['Active', 'Blocked', 'Self-Excluded']);
export const riskLevelEnum = pgEnum('risk_level', ['Low', 'Medium', 'High', 'VIP']);
export const gameTypeEnum = pgEnum('game_type', ['Bingo', 'Slot', 'Table', 'Live']);
export const gameStatusEnum = pgEnum('game_status', ['Active', 'Maintenance']);
export const transactionTypeEnum = pgEnum('transaction_type', ['Bet', 'Win', 'Deposit', 'Withdrawal', 'Jackpot']);
export const affiliateStatusEnum = pgEnum('affiliate_status', ['Active', 'Inactive']);

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  joinDate: timestamp("join_date").notNull().defaultNow(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default('0'),
  totalDeposited: decimal("total_deposited", { precision: 10, scale: 2 }).notNull().default('0'),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).notNull().default('0'),
  riskLevel: riskLevelEnum("risk_level").notNull().default('Low'),
  affiliateId: uuid("affiliate_id"),
  status: userStatusEnum("status").notNull().default('Active'),
  lastActive: timestamp("last_active").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinDate: true,
  balance: true,
  totalDeposited: true,
  totalWithdrawn: true,
  lastActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Affiliates Table
export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  status: affiliateStatusEnum("status").notNull().default('Active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  createdAt: true,
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Games Table
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: gameTypeEnum("type").notNull(),
  status: gameStatusEnum("status").notNull().default('Active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Transactions Table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  gameId: uuid("game_id").references(() => games.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
