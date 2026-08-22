import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
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

import {
  AttributionRecord,
  InsertAttributionRecord,
  InsertRecoveryRecord,
  PrivateConversation,
  PrivateConversationMessage,
  RecoveryRecord,
  attributionRecords,
  privateConversationMessages,
  privateConversations,
  recoveryRecords,
} from "../drizzle/schema";
import {
  assertPrivateConversationMessageContent,
  getPrivateConversationExpiry,
  type PrivateConversationMessageRole,
} from "../shared/agentosConversationPolicy";

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

export type CreatePrivateConversationInput = {
  conversationId: string;
  userId: number;
  providerId: string;
  modelId: string;
  now?: Date;
};

export type AppendPrivateConversationMessageInput = {
  messageId: string;
  conversationId: string;
  userId: number;
  role: PrivateConversationMessageRole;
  content: string;
  providerId: string;
  modelId: string;
  now?: Date;
};

export async function purgeExpiredPrivateConversations(
  userId: number,
  now = new Date()
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const expired = await db
    .select({ id: privateConversations.id })
    .from(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, userId),
        lt(privateConversations.expiresAt, now)
      )
    );
  for (const conversation of expired) {
    await db
      .delete(privateConversationMessages)
      .where(
        and(
          eq(privateConversationMessages.userId, userId),
          eq(privateConversationMessages.conversationId, conversation.id)
        )
      );
    await db
      .delete(privateConversations)
      .where(
        and(
          eq(privateConversations.userId, userId),
          eq(privateConversations.id, conversation.id)
        )
      );
  }
  return expired.length;
}

export async function createPrivateConversation(
  input: CreatePrivateConversationInput
): Promise<PrivateConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const now = input.now ?? new Date();
  await purgeExpiredPrivateConversations(input.userId, now);
  await db.insert(privateConversations).values({
    conversationId: input.conversationId,
    userId: input.userId,
    providerId: input.providerId,
    modelId: input.modelId,
    expiresAt: getPrivateConversationExpiry(now),
    createdAt: now,
    updatedAt: now,
  });
  const rows = await db
    .select()
    .from(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, input.userId),
        eq(privateConversations.conversationId, input.conversationId)
      )
    )
    .limit(1);
  return rows[0];
}

export async function listPrivateConversations(
  userId: number,
  now = new Date(),
  limit = 50
): Promise<PrivateConversation[]> {
  const db = await getDb();
  if (!db) return [];
  await purgeExpiredPrivateConversations(userId, now);
  return db
    .select()
    .from(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, userId),
        gt(privateConversations.expiresAt, now)
      )
    )
    .orderBy(desc(privateConversations.updatedAt))
    .limit(limit);
}

export async function getPrivateConversation(
  userId: number,
  conversationId: string,
  now = new Date()
): Promise<PrivateConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await purgeExpiredPrivateConversations(userId, now);
  const rows = await db
    .select()
    .from(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, userId),
        eq(privateConversations.conversationId, conversationId),
        gt(privateConversations.expiresAt, now)
      )
    )
    .limit(1);
  return rows[0];
}

export async function listPrivateConversationMessages(
  userId: number,
  conversationId: string,
  now = new Date()
): Promise<PrivateConversationMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const conversation = await getPrivateConversation(
    userId,
    conversationId,
    now
  );
  if (!conversation) return [];
  return db
    .select()
    .from(privateConversationMessages)
    .where(
      and(
        eq(privateConversationMessages.userId, userId),
        eq(privateConversationMessages.conversationId, conversation.id)
      )
    )
    .orderBy(asc(privateConversationMessages.createdAt));
}

export async function appendPrivateConversationMessage(
  input: AppendPrivateConversationMessageInput
): Promise<PrivateConversationMessage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const now = input.now ?? new Date();
  const conversation = await getPrivateConversation(
    input.userId,
    input.conversationId,
    now
  );
  if (!conversation) return undefined;
  const content = assertPrivateConversationMessageContent(input.content);
  await db.insert(privateConversationMessages).values({
    messageId: input.messageId,
    conversationId: conversation.id,
    userId: input.userId,
    role: input.role,
    content,
    providerId: input.providerId,
    modelId: input.modelId,
    createdAt: now,
  });
  await db
    .update(privateConversations)
    .set({
      providerId: input.providerId,
      modelId: input.modelId,
      expiresAt: getPrivateConversationExpiry(now),
      updatedAt: now,
    })
    .where(
      and(
        eq(privateConversations.userId, input.userId),
        eq(privateConversations.id, conversation.id)
      )
    );
  const rows = await db
    .select()
    .from(privateConversationMessages)
    .where(
      and(
        eq(privateConversationMessages.userId, input.userId),
        eq(privateConversationMessages.messageId, input.messageId)
      )
    )
    .limit(1);
  return rows[0];
}

export async function deletePrivateConversation(
  userId: number,
  conversationId: string,
  now = new Date()
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const conversation = await getPrivateConversation(
    userId,
    conversationId,
    now
  );
  if (!conversation) return false;
  await db
    .delete(privateConversationMessages)
    .where(
      and(
        eq(privateConversationMessages.userId, userId),
        eq(privateConversationMessages.conversationId, conversation.id)
      )
    );
  await db
    .delete(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, userId),
        eq(privateConversations.id, conversation.id)
      )
    );
  return true;
}

/**
 * Permanently removes only the caller's still-active private conversations.
 * Conversation content is neither returned nor copied into an audit record.
 */
export async function deleteAllPrivateConversations(
  userId: number,
  now = new Date()
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  await purgeExpiredPrivateConversations(userId, now);
  const rows = await db
    .select({ conversationId: privateConversations.conversationId })
    .from(privateConversations)
    .where(
      and(
        eq(privateConversations.userId, userId),
        gt(privateConversations.expiresAt, now)
      )
    );
  let deletedCount = 0;
  for (const row of rows) {
    if (await deletePrivateConversation(userId, row.conversationId, now)) {
      deletedCount += 1;
    }
  }
  return deletedCount;
}
