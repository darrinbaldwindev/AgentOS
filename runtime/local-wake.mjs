// LOCAL-RUNTIME-006 / MISSION-051: persistent manual wake bound to the existing governed worker registry.
// Reuses canonical boot, dispatch, authority, worker-contract and durable persistence primitives.
// Safe by default: DRY_RUN only, autonomy disabled, no provider or production writes.

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createLocalPersistence } from './local-persistence.mjs';
import { createLocalDispatchStore } from './local-dispatch-store.mjs';
import { createMissionBudget } from './mission-budget.mjs';
import { bootAgentOS } from './agentos-boot.mjs';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy, authoriseDispatch } from '../src/dispatch/authority.mjs';
import { createWorkerRegistry } from '../src/dispatch/worker-registry.mjs';
import { createDeterministicSkillAgent } from '../src/workers/deterministic-skill-agent.mjs';
import { validateProjectOverseerResponse } from '../scripts/validate-project-overseer-response.mjs';

const PROJECT_ID = 'agentos-local';
const RECEIVER = 'agentos:project-overseer';
const ISSUER = 'agentos:overseer';
const CAPABILITY = 'repository:read';
const WORKER_ID = 'agentos:deterministic-skill-agent';

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

function validateExecutionEnvelope(task) {
  if (typeof task.project_id !== 'string' || !task.project_id) throw new Error('PROJECT_ID_REQUIRED');
  if (task.project_id !== PROJECT_ID) throw new Error('PROJECT_ID_MISMATCH');
  if (task.consent_mode !== 'PRE_AUTHORIZED') throw new Error('CONSENT_REQUIRED');
  const required = task.required_capabilities ?? [];
  const granted = task.authority?.granted_capabilities ?? [];
  if (!Array.isArray(required) || !required.every((capability) => granted.includes(capability))) {
    throw new Error('CAPABILITY_MATCH_FAILED');
  }
  if (task.scope?.includes('production') || task.constraints?.some((value) => /production write/i.test(value))) {
    throw new Error('PRODUCTION_SCOPE_PROHIBITED');
  }
}

function createLocalWorkerRegistry() {
  const registry = createWorkerRegistry();
  const worker = createDeterministicSkillAgent({
    id: WORKER_ID,
    capabilities: [CAPABILITY],
    handler: async (task) => ({
      action: 'bounded-local-project-overseer-cycle',
      task_id: task.task_id,
      wake_trace_id: task.wake_trace_id,
      scope: task.scope,
      mode: 'DRY_RUN',
    }),
  });
  registry.register({
    ...worker.worker,
    name: 'Deterministic Local Skill Agent',
    type: 'deterministic',
    enabled: true,
  });
  return registry;
}

export async function wakeLocal({ root, objective = 'perform one bounded local AgentOS control-cycle action' } = {}) {
  if (!root) throw new TypeError('root is required');
  const config = safeRuntimeConfig(await readJson(join(root, 'config.json')));
  const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });
  const budget = await createMissionBudget({ filePath: join(root, 'state', 'mission-budget.sqlite') });

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
    project_id: PROJECT_ID,
    issuer: ISSUER,
    target: RECEIVER,
    objective,
    priority: 'high',
    scope: ['local-runtime'],
    constraints: ['DRY_RUN only', 'no external side effects', 'no production credentials', 'read-only execution boundary'],
    consent_mode: 'PRE_AUTHORIZED',
    required_capabilities: [CAPABILITY],
    authority: { action: 'execute', granted_capabilities: [CAPABILITY] },
    acceptance_criteria: ['bounded action verified', 'response schema validated', 'budget reconciled', 'registered worker selected'],
    status: 'queued',
    created_at: createdAt,
    wake_trace_id: wakeTraceId,
    scheduler_wake_at: createdAt,
  };

  validateExecutionEnvelope(task);
  authoriseDispatch(task, createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] }));

  await persistence.create('artifact', { id: taskId, artifactType: 'dispatch.task', payload: task });

  const reservation = budget.reserve({ project_id: PROJECT_ID, mission_id: task.mission_id, limit_units: 1 });
  let budgetOutcome;
  try {
    const dispatchStore = createLocalDispatchStore(persistence);
    const policy = createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] });
    const registry = createLocalWorkerRegistry();
    const selectedWorker = registry.findMatching({ requiredCapabilities: task.required_capabilities });
    if (!selectedWorker) throw new Error('WORKER_CAPABILITY_MATCH_FAILED');

    const completedTask = await runNextTask({
      tasks: await dispatchStore.list(),
      receiver: RECEIVER,
      authorityPolicy: policy,
      store: dispatchStore,
      execute: async (started) => {
        validateExecutionEnvelope(started);
        const worker = registry.findMatching({ requiredCapabilities: started.required_capabilities });
        if (!worker) throw new Error('WORKER_CAPABILITY_MATCH_FAILED');
        const workerResult = await worker.execute(started);
        if (!workerResult.success) throw new Error(`WORKER_EXECUTION_FAILED: ${workerResult.error}`);
        return {
          source_agent: workerResult.workerId,
          worker_id: workerResult.workerId,
          worker_output: workerResult.output,
          worker_latency_ms: workerResult.latencyMs,
          implemented: ['executed one bounded local Project Overseer control cycle through the registered deterministic worker'],
          verification: [
            'canonical runner completed claimed → working → verification → completed',
            'issuer, consent mode and required/granted capability match were validated before execution',
            'registered worker was enabled, executable and matched every required capability',
            'DRY_RUN/no-production-credential constraints were preserved',
          ],
          evidence: [
            `local:wake:${started.wake_trace_id}`,
            `local:task:${started.task_id}`,
            `worker:${workerResult.workerId}`,
            `budget:reservation:${reservation.reservation_id}`,
          ],
          repository_commit: 'local-runtime',
          next_action: 'reconcile returned evidence with upstream Overseer log',
        };
      },
    });

    if (!completedTask) throw new Error('LOCAL_WAKE_TASK_NOT_EXECUTED');
    budgetOutcome = budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: 1 });

    const completedAt = new Date().toISOString();
    const executionEvidence = completedTask.evidence ?? {};
    const response = {
      mission_id: completedTask.task_id,
      source_agent: executionEvidence.source_agent ?? WORKER_ID,
      wake_trace_id: completedTask.wake_trace_id,
      status: 'COMPLETED',
      started_at: completedTask.created_at,
      completed_at: completedAt,
      repository_commit: executionEvidence.repository_commit ?? 'local-runtime',
      inspection_summary: 'installed persistent runtime inspected; safe DRY_RUN boundary confirmed; registered worker selected by strict capability match',
      work_claimed: [completedTask.objective],
      work_implemented: executionEvidence.implemented ?? [],
      verification: [...(executionEvidence.verification ?? []), `budget reconciled: ${budgetOutcome.status}`],
      evidence: [...(executionEvidence.evidence ?? []), `worker-output:${JSON.stringify(executionEvidence.worker_output)}`],
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
      projectId: PROJECT_ID,
      workerId: response.source_agent,
      budgetReservationId: reservation.reservation_id,
      status: response.status,
    });

    return Object.freeze({ status: response.status, response, task: completedTask, boot, task_id: taskId, budget: budgetOutcome });
  } catch (error) {
    if (!budgetOutcome) {
      try { budgetOutcome = budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: 0 }); } catch {}
    }
    throw error;
  } finally {
    budget.close();
  }
}

export function resolveLocalWakeRoot(env = process.env, platformHome = homedir()) {
  return resolve(env.AGENTOS_HOME || join(platformHome, '.agentos'));
}

export async function main({ env = process.env, argv = process.argv, platformHome = homedir() } = {}) {
  const root = resolveLocalWakeRoot(env, platformHome);
  const objective = argv.slice(2).join(' ').trim() || undefined;
  const result = await wakeLocal({ root, objective });
  console.log(JSON.stringify({
    status: result.status,
    task_id: result.task_id,
    mission_id: result.response.mission_id,
    wake_trace_id: result.response.wake_trace_id,
    source_agent: result.response.source_agent,
    mode: result.boot.capabilities.mode,
    budget_status: result.budget.status,
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
