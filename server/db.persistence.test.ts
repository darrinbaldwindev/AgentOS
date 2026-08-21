import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ rows: [] as Record<string, unknown>[] }));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => ({
    insert: () => ({
      values: async (value: Record<string, unknown>) => {
        state.rows.push({
          ...value,
          occurredAt: value.occurredAt ?? new Date(),
        });
      },
    }),
    select: () => ({
      from: () => ({
        where: () => {
          const query = {
            limit: async (limit = 1) => state.rows.slice(-limit).reverse(),
            orderBy: () => query,
          };
          return query;
        },
      }),
    }),
  })),
}));

process.env.DATABASE_URL = "mysql://agentos-test";
const {
  appendAttributionRecord,
  appendRecoveryRecord,
  listAttributionRecords,
  listRecoveryRecords,
} = await import("./db");

describe("AgentOS persistence helpers", () => {
  beforeEach(() => {
    state.rows.length = 0;
  });

  it("appends and lists sanitized recovery records without prompt or secret fields", async () => {
    const record = await appendRecoveryRecord({
      eventId: "recovery-test-1",
      userId: 42,
      kind: "rate_limit",
      provider: "Together AI",
      action: "Queue local fallback",
      status: "resolved",
    });
    expect(record).toMatchObject({
      eventId: "recovery-test-1",
      userId: 42,
      containsPrompt: false,
      containsSecret: false,
    });
    expect(record).not.toHaveProperty("prompt");
    expect(record).not.toHaveProperty("secret");
    expect(await listRecoveryRecords(42, 10)).toHaveLength(1);
  });

  it("appends and lists owner-scoped attribution records with only approved fields", async () => {
    const record = await appendAttributionRecord({
      eventId: "attribution-test-1",
      userId: 42,
      eventType: "referral_click",
      provider: "Taskade",
      consent: "granted",
    });
    expect(record).toMatchObject({
      eventId: "attribution-test-1",
      userId: 42,
      eventType: "referral_click",
    });
    expect(record).not.toHaveProperty("referralParams");
    expect(await listAttributionRecords(42, 10)).toHaveLength(1);
  });
});
