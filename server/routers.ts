import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { invokeLLM } from "./_core/llm";
import {
  ownerOrAdminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import {
  selectTelemetryRange,
  summarizeTelemetry,
  type TelemetryRange,
} from "../shared/agentosTelemetry";
import {
  appendAttributionRecord,
  appendRecoveryRecord,
  listAttributionRecords,
  listRecoveryRecords,
} from "./db";
import {
  executeMockRoute,
  getEndUserMockCatalog,
  getMockCatalog,
  getMockHealth,
  getMockScenarios,
  resolveMockRoute,
} from "./agentosOrchestrator";

const providerIds = [
  "ollama",
  "together",
  "taskade",
  "elevenlabs",
  "n8n",
  "github",
] as const;
const recoveryKinds = [
  "rate_limit",
  "quota_exhausted",
  "provider_offline",
  "capability_mismatch",
  "permission_denied",
  "tool_timeout",
  "partial_stream",
  "artifact_conflict",
  "referral_failure",
] as const;
const agentosCapabilities = [
  "chat",
  "streaming",
  "tools",
  "vision",
  "audio",
  "json",
  "local",
  "mcp",
] as const;

const chatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  agentos: router({
    access: router({
      status: protectedProcedure.query(({ ctx }) => ({
        allowed:
          ctx.user.role === "admin" ||
          (Boolean(ENV.ownerOpenId) && ctx.user.openId === ENV.ownerOpenId),
        role: ctx.user.role,
      })),
    }),

    orchestration: router({
      catalog: ownerOrAdminProcedure.query(() => getMockCatalog()),
      endUserCatalog: protectedProcedure.query(() => getEndUserMockCatalog()),
      health: ownerOrAdminProcedure.query(() => getMockHealth()),
      scenarios: ownerOrAdminProcedure.query(() => getMockScenarios()),
      resolve: protectedProcedure
        .input(
          z.object({
            providerId: z.enum(providerIds),
            modelId: z.string().trim().min(1).max(128),
            agentId: z.string().trim().min(1).max(128),
            requestedCapabilities: z.array(z.enum(agentosCapabilities)).max(8),
            consent: z.enum(["granted", "declined"]),
          })
        )
        .query(({ input }) => resolveMockRoute(input)),
      execute: protectedProcedure
        .input(
          z.object({
            providerId: z.enum(providerIds),
            modelId: z.string().trim().min(1).max(128),
            agentId: z.string().trim().min(1).max(128),
            requestedCapabilities: z.array(z.enum(agentosCapabilities)).max(8),
            consent: z.enum(["granted", "declined"]),
            message: z.string().trim().min(1).max(12000),
            conversationId: z.string().trim().min(1).max(128),
            requestId: z.string().trim().min(1).max(128),
            inputTokens: z.number().int().min(0).max(100000),
            maxContextTokens: z.number().int().min(1).max(200000),
          })
        )
        .mutation(({ input }) => executeMockRoute(input)),
    }),

    chat: protectedProcedure
      .input(
        z.object({
          providerId: z.enum(providerIds),
          modelId: z.string().trim().min(1).max(128).optional(),
          previousProviderId: z.enum(providerIds).optional(),
          previousModelId: z.string().trim().min(1).max(128).optional(),
          consent: z.enum(["granted", "declined"]),
          messages: z.array(chatMessage).min(1).max(40),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          ...(input.modelId ? { model: input.modelId } : {}),
          messages: [
            {
              role: "system",
              content: `You are AgentOS routing through the selected provider contract ${input.providerId}. Live affiliate routing is disabled. Do not claim external provider actions were performed.`,
            },
            ...input.messages,
          ],
          maxTokens: 1200,
        });

        const content = response.choices[0]?.message.content;
        const text =
          typeof content === "string"
            ? content
            : content
                .map(part =>
                  part.type === "text" ? part.text : "[non-text content]"
                )
                .join("\n");
        return {
          providerId: input.providerId,
          modelId: response.model,
          content: text,
          attributionRecorded: false,
        };
      }),

    controlChat: ownerOrAdminProcedure
      .input(
        z.object({
          providerId: z.enum(providerIds),
          modelId: z.string().trim().min(1).max(128).optional(),
          previousProviderId: z.enum(providerIds).optional(),
          previousModelId: z.string().trim().min(1).max(128).optional(),
          consent: z.enum(["granted", "declined"]),
          messages: z.array(chatMessage).min(1).max(40),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const switched =
          (input.previousProviderId !== undefined &&
            input.previousProviderId !== input.providerId) ||
          (input.previousModelId !== undefined &&
            input.previousModelId !== input.modelId);
        if (switched) {
          await appendAttributionRecord({
            eventId: `control-model-switch-${ctx.user.id}-${Date.now()}`,
            userId: ctx.user.id,
            eventType: "model_switch",
            provider: input.providerId,
            consent: input.consent,
          });
        }
        const response = await invokeLLM({
          ...(input.modelId ? { model: input.modelId } : {}),
          messages: [
            {
              role: "system",
              content: `You are AgentOS owner control-plane routing through ${input.providerId}. Live affiliate routing is disabled.`,
            },
            ...input.messages,
          ],
          maxTokens: 1200,
        });
        const content = response.choices[0]?.message.content;
        const text =
          typeof content === "string"
            ? content
            : content
                .map(part =>
                  part.type === "text" ? part.text : "[non-text content]"
                )
                .join("\\n");
        return {
          providerId: input.providerId,
          modelId: response.model,
          content: text,
          attributionRecorded: switched,
        };
      }),

    recovery: router({
      list: ownerOrAdminProcedure
        .input(
          z
            .object({ limit: z.number().int().min(1).max(100).default(50) })
            .optional()
        )
        .query(({ ctx, input }) =>
          listRecoveryRecords(ctx.user.id, input?.limit ?? 50)
        ),
      append: ownerOrAdminProcedure
        .input(
          z.object({
            eventId: z.string().trim().min(1).max(96),
            kind: z.enum(recoveryKinds),
            provider: z.string().trim().min(1).max(128),
            action: z.string().trim().min(1).max(2000),
            status: z.enum(["resolved", "awaiting_user", "blocked"]),
          })
        )
        .mutation(({ ctx, input }) =>
          appendRecoveryRecord({ ...input, userId: ctx.user.id })
        ),
    }),

    telemetry: ownerOrAdminProcedure
      .input(
        z.object({ range: z.enum(["2D", "4D", "7D"]).default("7D") }).optional()
      )
      .query(({ input }) => {
        const range = (input?.range ?? "7D") as TelemetryRange;
        const points = selectTelemetryRange(range);
        return { range, points, summary: summarizeTelemetry(points) };
      }),

    attribution: router({
      list: ownerOrAdminProcedure
        .input(
          z
            .object({ limit: z.number().int().min(1).max(200).default(100) })
            .optional()
        )
        .query(({ ctx, input }) =>
          listAttributionRecords(ctx.user.id, input?.limit ?? 100)
        ),
      append: ownerOrAdminProcedure
        .input(
          z.object({
            eventId: z.string().trim().min(1).max(96),
            eventType: z.enum(["model_switch", "referral_click"]),
            provider: z.string().trim().min(1).max(128),
            consent: z.enum(["granted", "declined"]),
          })
        )
        .mutation(({ ctx, input }) =>
          appendAttributionRecord({ ...input, userId: ctx.user.id })
        ),
    }),
  }),
});

export type AppRouter = typeof appRouter;
