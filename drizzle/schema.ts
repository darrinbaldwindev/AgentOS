import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Append-only operational recovery records. No prompt, secret, project, thread,
 * or affiliate parameter fields are intentionally present in this table.
 */
export const recoveryRecords = mysqlTable(
  "recovery_records",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 96 }).notNull().unique(),
    userId: int("userId").notNull(),
    kind: mysqlEnum("kind", [
      "rate_limit",
      "quota_exhausted",
      "provider_offline",
      "capability_mismatch",
      "permission_denied",
      "tool_timeout",
      "partial_stream",
      "artifact_conflict",
      "referral_failure",
    ]).notNull(),
    provider: varchar("provider", { length: 128 }).notNull(),
    action: text("action").notNull(),
    status: mysqlEnum("status", [
      "resolved",
      "awaiting_user",
      "blocked",
    ]).notNull(),
    containsPrompt: boolean("containsPrompt").default(false).notNull(),
    containsSecret: boolean("containsSecret").default(false).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => ({
    userOccurredAtIdx: index("recovery_user_occurred_idx").on(
      table.userId,
      table.occurredAt
    ),
  })
);

export type RecoveryRecord = typeof recoveryRecords.$inferSelect;
export type InsertRecoveryRecord = typeof recoveryRecords.$inferInsert;

/**
 * Attribution ledger limited to the two approved event types. It stores only
 * aggregate-safe descriptors and never stores redirect parameters or context IDs.
 */
export const attributionRecords = mysqlTable(
  "attribution_records",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 96 }).notNull().unique(),
    userId: int("userId").notNull(),
    eventType: mysqlEnum("eventType", [
      "model_switch",
      "referral_click",
    ]).notNull(),
    provider: varchar("provider", { length: 128 }).notNull(),
    consent: mysqlEnum("consent", ["granted", "declined"]).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => ({
    userOccurredAtIdx: index("attribution_user_occurred_idx").on(
      table.userId,
      table.occurredAt
    ),
  })
);

export type AttributionRecord = typeof attributionRecords.$inferSelect;
export type InsertAttributionRecord = typeof attributionRecords.$inferInsert;
