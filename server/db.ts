import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { and, desc } from "drizzle-orm";
import {
  AttributionRecord,
  InsertAttributionRecord,
  InsertRecoveryRecord,
  RecoveryRecord,
  attributionRecords,
  recoveryRecords,
} from "../drizzle/schema";

export async function appendRecoveryRecord(
  record: Omit<InsertRecoveryRecord, "userId"> & { userId: number }
): Promise<RecoveryRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(recoveryRecords).values({
    ...record,
    containsPrompt: false,
    containsSecret: false,
  });
  const rows = await db
    .select()
    .from(recoveryRecords)
    .where(
      and(
        eq(recoveryRecords.userId, record.userId),
        eq(recoveryRecords.eventId, record.eventId)
      )
    )
    .limit(1);
  return rows[0];
}

export async function listRecoveryRecords(
  userId: number,
  limit = 50
): Promise<RecoveryRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(recoveryRecords)
    .where(eq(recoveryRecords.userId, userId))
    .orderBy(desc(recoveryRecords.occurredAt))
    .limit(limit);
}

export async function appendAttributionRecord(
  record: Omit<InsertAttributionRecord, "userId"> & { userId: number }
): Promise<AttributionRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(attributionRecords).values(record);
  const rows = await db
    .select()
    .from(attributionRecords)
    .where(
      and(
        eq(attributionRecords.userId, record.userId),
        eq(attributionRecords.eventId, record.eventId)
      )
    )
    .limit(1);
  return rows[0];
}

export async function listAttributionRecords(
  userId: number,
  limit = 100
): Promise<AttributionRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(attributionRecords)
    .where(eq(attributionRecords.userId, userId))
    .orderBy(desc(attributionRecords.occurredAt))
    .limit(limit);
}
