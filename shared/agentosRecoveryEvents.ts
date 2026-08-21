import type {
  AdapterResponse,
  AgentOSProviderId,
  ConnectionState,
  ExecutionState,
  RecoveryAction,
} from "./agentosContracts";

export const LOCAL_RECOVERY_EVENT_TYPES = [
  "execution",
  "model_switch",
  "fallback_selected",
  "provider_status",
  "consent",
  "referral_click",
  "redirect_failure",
  "tool_failure",
  "recovery_action",
] as const;

export type LocalRecoveryEventType =
  (typeof LOCAL_RECOVERY_EVENT_TYPES)[number];

export interface LocalRecoveryEvent {
  sequence: number;
  eventType: LocalRecoveryEventType;
  providerId: AgentOSProviderId;
  modelId: string | null;
  connection: ConnectionState | null;
  executionState: ExecutionState | null;
  recoveryAction: RecoveryAction | null;
  consent: "granted" | "declined" | null;
  code: string | null;
  safeSummary: string;
  occurredAt: number;
}

export interface RecoveryEventMappingInput {
  providerId: AgentOSProviderId;
  modelId: string;
  consent: "granted" | "declined";
  connection: ConnectionState;
  response: AdapterResponse | null;
  occurredAt: number;
  sequenceStart?: number;
}

function event(
  sequence: number,
  details: Omit<LocalRecoveryEvent, "sequence">
): LocalRecoveryEvent {
  return { sequence, ...details };
}

/**
 * Map locally-determined orchestration outcomes to records that intentionally
 * exclude messages, prompts, secrets, thread IDs, project IDs, redirect data,
 * and raw provider payloads. Persistence remains a separate owner-gated step.
 */
export function mapLocalRecoveryEvents(
  input: RecoveryEventMappingInput
): readonly LocalRecoveryEvent[] {
  const start = input.sequenceStart ?? 1;
  const base = {
    providerId: input.providerId,
    modelId: input.modelId,
    consent: input.consent,
    occurredAt: input.occurredAt,
  };
  const events: LocalRecoveryEvent[] = [
    event(start, {
      ...base,
      eventType: "provider_status",
      connection: input.connection,
      executionState: null,
      recoveryAction: null,
      code: null,
      safeSummary: `Local provider status is ${input.connection}.`,
    }),
  ];

  if (!input.response) {
    events.push(
      event(start + 1, {
        ...base,
        eventType: "recovery_action",
        connection: input.connection,
        executionState: "failed",
        recoveryAction: "stop",
        code: "route_rejected",
        safeSummary: "Local route was rejected before adapter execution.",
      })
    );
    return events;
  }

  if (input.response.ok) {
    events.push(
      event(start + 1, {
        ...base,
        eventType: "execution",
        connection: input.connection,
        executionState: input.response.result.state,
        recoveryAction: null,
        code: null,
        safeSummary: "Local mock execution completed.",
      })
    );
    return events;
  }

  events.push(
    event(start + 1, {
      ...base,
      eventType: "execution",
      connection: input.response.failure.connection,
      executionState: input.response.failure.state,
      recoveryAction: input.response.failure.recoveryAction,
      code: input.response.failure.code,
      safeSummary: "Local mock execution returned a governed failure state.",
    })
  );
  events.push(
    event(start + 2, {
      ...base,
      eventType: "recovery_action",
      connection: input.response.failure.connection,
      executionState: input.response.failure.state,
      recoveryAction: input.response.failure.recoveryAction,
      code: input.response.failure.code,
      safeSummary: `Recommended local recovery action is ${input.response.failure.recoveryAction}.`,
    })
  );
  return events;
}
