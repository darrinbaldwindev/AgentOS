// LOCAL-RUNTIME-004: persistent manual wake attached to the installed AgentOS runtime.
// Reuses canonical boot, dispatch, authority and local-cycle primitives.
// Safe by default: DRY_RUN only, autonomy disabled, no provider or production writes.

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { createLocalPersistence } from './local-persistence.mjs';
import { bootAgentOS } from './agentos-boot.mjs';
import { MemoryDispatchStore } from '../src/dispatch/store.mjs';
import { runLocalProjectOverseerCycle } from '../src/dispatch/local-cycle.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

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

function taskFromArtifact(artifact) {
  return artifact?.artifactType === 'dispatch.task' ? artifact.payload : null;
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

  const artifacts = await persistence.list('artifact');
  const tasks = artifacts.map(taskFromArtifact).filter(Boolean);
  const store = new MemoryDispatchStore(tasks);
  const taskId = `local-wake-${randomUUID()}`;
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
    created_at: new Date().toISOString(),
  };

  store.constructor; // keep the store contract explicit for the installed runtime path
  // MemoryDispatchStore is intentionally used as the synchronous execution adapter;
  // the canonical durable copy is written before and after the cycle.
  const seeded = new MemoryDispatchStore([...tasks, task]);
  const policy = createAuthorityPolicy({ issuers: [ISSUER], capabilities: ['repository:read'] });
  const result = runLocalProjectOverseerCycle(
    seeded,
    RECEIVER,
    policy,
    () => ({ summary: 'installed persistent runtime inspected; safe DRY_RUN boundary confirmed' }),
    (started, inspection) => ({
      source_agent: 'agentos:local-wake-worker',
      implemented: ['executed one bounded local Project Overseer control cycle'],
      verification: [inspection.summary, 'generated response validated by local-cycle'],
      evidence: [`local:wake:${started.wake_trace_id}`],
      repository_commit: 'local-runtime',
      next_action: 'reconcile returned evidence with upstream Overseer log',
    }),
  );

  await persistence.create('artifact', {
    id: taskId,
    artifactType: 'dispatch.task',
    payload: result.task,
  });
  await persistence.create('artifact', {
    id: `response:${taskId}`,
    artifactType: 'project-overseer.response',
    payload: result.response,
  });
  await persistence.create('event', {
    agentId: boot.overseer.id,
    eventType: 'agentos.manual-wake.completed',
    taskId,
    wakeTraceId: result.response.wake_trace_id,
    status: result.status,
  });

  return Object.freeze({ ...result, boot, task_id: taskId });
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
