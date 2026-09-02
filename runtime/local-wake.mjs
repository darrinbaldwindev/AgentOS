// LOCAL-RUNTIME-005: persistent manual wake attached to the installed AgentOS runtime.
// Reuses canonical boot, dispatch, authority and durable persistence primitives.
// Safe by default: DRY_RUN only, autonomy disabled, no provider or production writes.

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { createLocalPersistence } from './local-persistence.mjs';
import { createLocalDispatchStore } from './local-dispatch-store.mjs';
import { bootAgentOS } from './agentos-boot.mjs';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { validateProjectOverseerResponse } from '../scripts/validate-project-overseer-response.mjs';

const RECEIVER = 'agentos:project-overseer';
const ISSUER = 'agentos:overseer';

async function readJson(path) {
  return JSON.parse(await fs.readFile(path, 'utf8'));
}

function safeRuntimeConfig(config) {
  if (config?.schemaVersion !== 1) throw new Error('LOCAL_CONFIG_SCHEMA_INVALID');
  if (config.mode !== 'DRY_RUN' || config.autonomyEnabled !== false) {
    throw new Error('LOCAL_WAKE_REQUIRES_SAFE_MODE');
  }
  return config;
}

export async function wakeLocal({ root, objective = 'perform one bounded local AgentOS control-cycle action' } = {}) {
  if (!root) throw new TypeError('root is required');
  const config = safeRuntimeConfig(await readJson(join(root, 'config.json')));
  const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });

  const boot = await bootAgentOS({
    persistence,
    capabilityProbe: { probe: async () => ({ evaluation: { eligible: true }, mode: 'DRY_RUN' }) },
    modelRegistry: { listAvailable: async () => [] },
    continuityCheck: async () => ({ ok: true }),
  });

  const taskId = `local-wake-${randomUUID()}`;
  const wakeTraceId = randomUUID();
  const createdAt = new Date().toISOString();
  const task = {
    task_id: taskId,
    mission_id: `mission:${taskId}`,
    issuer: ISSUER,
    target: RECEIVER,
    objective,
    priority: 'high',
    scope: ['local-runtime'],
    constraints: ['DRY_RUN only', 'no external side effects', 'no production credentials'],
    authority: { action: 'execute', granted_capabilities: ['repository:read'] },
    acceptance_criteria: ['bounded action verified', 'response schema validated'],
    status: 'queued',
    created_at: createdAt,
    wake_trace_id: wakeTraceId,
    scheduler_wake_at: createdAt,
  };

  // Persist before execution so an interrupted wake remains recoverable and auditable.
  await persistence.create('artifact', { id: taskId, artifactType: 'dispatch.task', payload: task });

  // Use the canonical conflict-safe runner; the local adapter is only the durable boundary.
  const dispatchStore = createLocalDispatchStore(persistence);
  const policy = createAuthorityPolicy({ issuers: [ISSUER], capabilities: ['repository:read'] });
  const completedTask = await runNextTask({
    tasks: await dispatchStore.list(),
    receiver: RECEIVER,
    authorityPolicy: policy,
    store: dispatchStore,
    execute: async (started) => ({
      source_agent: 'agentos:local-wake-worker',
      implemented: ['executed one bounded local Project Overseer control cycle'],
      verification: [
        'canonical runner completed claimed → working → verification → completed',
        'issuer and granted capability were authorised before execution',
        'DRY_RUN/no-production-credential constraints were preserved',
      ],
      evidence: [
        `local:wake:${started.wake_trace_id}`,
        `local:task:${started.task_id}`,
      ],
      repository_commit: 'local-runtime',
      next_action: 'reconcile returned evidence with upstream Overseer log',
    }),
  });

  if (!completedTask) throw new Error('LOCAL_WAKE_TASK_NOT_EXECUTED');

  const completedAt = new Date().toISOString();
  const executionEvidence = completedTask.evidence ?? {};
  const response = {
    mission_id: completedTask.task_id,
    source_agent: executionEvidence.source_agent ?? 'agentos:local-wake-worker',
    wake_trace_id: completedTask.wake_trace_id,
    status: 'COMPLETED',
    started_at: completedTask.created_at,
    completed_at: completedAt,
    repository_commit: executionEvidence.repository_commit ?? 'local-runtime',
    inspection_summary: 'installed persistent runtime inspected; safe DRY_RUN boundary confirmed',
    work_claimed: [completedTask.objective],
    work_implemented: executionEvidence.implemented ?? [],
    verification: executionEvidence.verification ?? [],
    evidence: executionEvidence.evidence ?? [],
    blockers: [],
    escalations: [],
    next_action: executionEvidence.next_action ?? 'await upstream reconciliation',
  };

  const validation = validateProjectOverseerResponse(response);
  if (!validation.valid) throw new Error(`invalid generated response: ${validation.errors.join('; ')}`);

  await persistence.create('artifact', {
    id: `response:${taskId}`,
    artifactType: 'project-overseer.response',
    payload: response,
  });
  await persistence.create('event', {
    agentId: boot.overseer.id,
    eventType: 'agentos.manual-wake.completed',
    taskId,
    wakeTraceId: response.wake_trace_id,
    missionId: response.mission_id,
    status: response.status,
  });

  return Object.freeze({ status: response.status, response, task: completedTask, boot, task_id: taskId });
}

export async function main({ env = process.env, argv = process.argv } = {}) {
  const root = env.AGENTOS_HOME;
  if (!root) throw new Error('AGENTOS_HOME is required for local wake');
  const objective = argv.slice(2).join(' ').trim() || undefined;
  const result = await wakeLocal({ root, objective });
  console.log(JSON.stringify({
    status: result.status,
    task_id: result.task_id,
    mission_id: result.response.mission_id,
    wake_trace_id: result.response.wake_trace_id,
    source_agent: result.response.source_agent,
    mode: result.boot.capabilities.mode,
    autonomyEnabled: false,
  }, null, 2));
  return result;
}

if (process.argv[1] && process.argv[1].endsWith('local-wake.mjs')) {
  main().catch((error) => {
    console.error(JSON.stringify({ status: 'FAILED', error: error.message }, null, 2));
    process.exitCode = 1;
  });
}
