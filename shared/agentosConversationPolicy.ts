export const PRIVATE_CONVERSATION_RETENTION_DAYS = 30;
export const PRIVATE_CONVERSATION_RETENTION_MS =
  PRIVATE_CONVERSATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const PRIVATE_CONVERSATION_MAX_MESSAGE_CHARS = 12_000;

export type PrivateConversationMessageRole = "user" | "assistant";

const secretLikePatterns = [
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/i,
  /\b(?:sk|rk|pk)_[A-Za-z0-9_-]{12,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|secret)\s*[:=]\s*[^\s]{8,}/i,
];

export function getPrivateConversationExpiry(now = new Date()): Date {
  return new Date(now.getTime() + PRIVATE_CONVERSATION_RETENTION_MS);
}

export function isPrivateConversationExpired(
  expiresAt: Date,
  now = new Date()
): boolean {
  return expiresAt.getTime() <= now.getTime();
}

/**
 * Messages are user-visible only. Reject likely credential material before it
 * can reach persistence; never echo the rejected input in errors or logs.
 */
export function assertPrivateConversationMessageContent(
  content: string
): string {
  const normalized = content.trim();
  if (!normalized) throw new Error("A saved message cannot be empty.");
  if (normalized.length > PRIVATE_CONVERSATION_MAX_MESSAGE_CHARS) {
    throw new Error("A saved message exceeds the allowed length.");
  }
  if (secretLikePatterns.some(pattern => pattern.test(normalized))) {
    throw new Error("Remove secret-like material before saving this message.");
  }
  return normalized;
}
