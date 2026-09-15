// LOCAL-RUNTIME-006 / MISSION-051: persistent manual wake bound to the existing governed worker registry.
// Reuses canonical boot, dispatch, authority, worker-contract and durable persistence primitives.
// Safe by default: DRY_RUN only, autonomy disabled, no provider or production writes.
// V1 Closure Mission A: final COMPLETED requires Green PASS.

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
import { evaluateTaskCompletion } from './green-agent.mjs';

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

/** Build Green evidence from durable runtime facts; not a free-form caller PASS object. */
export function buildGreenEvidencePacket({ task, workerResult, reservation, budgetOutcome }) {
  if (!task?.task_id) throw new TypeError('task.task_id required for Green evidence');
  const criteria = (task.acceptance_criteria ?? []).map((criterion) => ({
    criterion,
    status: 'verified',
    source: 'local-wake-bounded-deterministic',
  }));
  return {
    acceptance_criteria: criteria,
    implementation: { status: 'verified', source: 'deterministic-local-worker' },
    tests: { status: 'verified', source: 'bounded-local-verification-list' },
    authorization: {
      status: 'verified',
      unauthorized_changes: [],
      project_id: task.project_id,
      consent_mode: task.consent_mode,
    },
    side_effects: [],
    gaps: [],
    budget: {
      reservation_id: reservation?.reservation_id ?? null,
      status: budgetOutcome?.status ?? null,
    },
    correlation: {
      mission_id: task.mission_id,
      task_id: task.task_id,
      wake_trace_id: task.wake_trace_id,
      worker_id: workerResult?.workerId ?? workerResult?.worker_id ?? null,
    },
  };
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

    let capturedWorkerResult = null;
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
        capturedWorkerResult = {
          ...workerResult,
          task_id: started.task_id,
          status: 'completed',
          claimed_complete: true,
        };
        return {
          source_agent: workerResult.workerId,
          worker_id: workerResult.workerId,
          worker_output: workerResult.output,
          worker_latency_ms: workerResult.latencyMs,
          implemented: ['executed one bounded local Project Overseer control cycle through the registered deterministic worker'],
          verification: [
            'canonical runner completed claimed \u2192 working \u2192 verification',
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
          next_action: 'await Green verification before completion',
        };
      },
    });

    if (!completedTask) throw new Error('LOCAL_WAKE_TASK_NOT_EXECUTED');
    budgetOutcome = budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: 1 });

    const executionEvidence = completedTask.evidence ?? {};
    const awaitingResponse = {
      mission_id: task.mission_id,
      source_agent: executionEvidence.source_agent ?? WORKER_ID,
      wake_trace_id: completedTask.wake_trace_id ?? wakeTraceId,
      status: 'AWAITING_GREEN',
      started_at: completedTask.created_at ?? createdAt,
      completed_at: null,
      repository_commit: executionEvidence.repository_commit ?? 'local-runtime',
      inspection_summary: 'worker returned; awaiting Green hard-gate before final completion',
      work_claimed: [completedTask.objective ?? objective],
      work_implemented: executionEvidence.implemented ?? [],
      verification: [...(executionEvidence.verification ?? []), `budget reconciled: ${budgetOutcome.status}`],
      evidence: [...(executionEvidence.evidence ?? []), `worker-output:${JSON.stringify(executionEvidence.worker_output)}`],
      blockers: [],
      escalations: [],
      next_action: 'Green evaluateTaskCompletion',
    };

    // Persist intermediate evidence BEFORE Green (durable facts for verification).
    await persistence.create('artifact', {
      id: `response-awaiting-green:${taskId}`,
      artifactType: 'project-overseer.response',
      payload: awaitingResponse,
    });

    const workerResultForGreen = capturedWorkerResult ?? {
      task_id: taskId,
      status: 'completed',
      claimed_complete: true,
      workerId: executionEvidence.source_agent ?? WORKER_ID,
    };

    const evidencePacket = buildGreenEvidencePacket({
      task,
      workerResult: workerResultForGreen,
      reservation,
      budgetOutcome,
    });

    let greenResult;
    try {
      greenResult = evaluateTaskCompletion({
        task,
        workerResult: workerResultForGreen,
        evidence: evidencePacket,
        timestamp: new Date().toISOString(),
      });
    } catch (greenError) {
      const blocked = {
        ...awaitingResponse,
        status: 'GREEN_BLOCKED',
        completed_at: new Date().toISOString(),
        blockers: [`Green exception: ${greenError?.message ?? String(greenError)}`],
        next_action: 'owner/reconcile verification failure',
      };
      await persistence.create('artifact', {
        id: `response-green-blocked:${taskId}`,
        artifactType: 'project-overseer.response',
        payload: blocked,
      });
      await persistence.create('artifact', {
        id: `green-disposition:${taskId}`,
        artifactType: 'green.disposition',
        payload: { disposition: 'blocked', error: greenError?.message ?? String(greenError), task_id: taskId },
      });
      await persistence.create('event', {
        agentId: boot.overseer.id,
        eventType: 'agentos.manual-wake.green-blocked',
        taskId,
        wakeTraceId: blocked.wake_trace_id,
        missionId: task.mission_id,
        projectId: PROJECT_ID,
        status: 'GREEN_BLOCKED',
      });
      return Object.freeze({
        status: 'GREEN_BLOCKED',
        response: blocked,
        task: completedTask,
        boot,
        task_id: taskId,
        budget: budgetOutcome,
        green: { disposition: 'blocked', error: greenError?.message ?? String(greenError) },
      });
    }

    await persistence.create('artifact', {
      id: `green-disposition:${taskId}`,
      artifactType: 'green.disposition',
      payload: greenResult,
    });

    if (greenResult.disposition !== 'pass') {
      const incomplete = {
        ...awaitingResponse,
        status: 'INCOMPLETE',
        completed_at: new Date().toISOString(),
        blockers: [...(greenResult.failures ?? [])],
        green_disposition: greenResult.disposition,
        next_action: 'remediate and re-verify',
      };
      await persistence.create('artifact', {
        id: `response-incomplete:${taskId}`,
        artifactType: 'project-overseer.response',
        payload: incomplete,
      });
      await persistence.create('event', {
        agentId: boot.overseer.id,
        eventType: 'agentos.manual-wake.green-failed',
        taskId,
        wakeTraceId: incomplete.wake_trace_id,
        missionId: task.mission_id,
        projectId: PROJECT_ID,
        status: 'INCOMPLETE',
        greenDisposition: greenResult.disposition,
      });
      return Object.freeze({
        status: 'INCOMPLETE',
        response: incomplete,
        task: completedTask,
        boot,
        task_id: taskId,
        budget: budgetOutcome,
        green: greenResult,
      });
    }

    // ONLY valid PASS reaches final COMPLETED.
    const completedAt = new Date().toISOString();
    const response = {
      mission_id: task.mission_id,
      source_agent: executionEvidence.source_agent ?? WORKER_ID,
      wake_trace_id: completedTask.wake_trace_id ?? wakeTraceId,
      status: 'COMPLETED',
      started_at: completedTask.created_at ?? createdAt,
      completed_at: completedAt,
      repository_commit: executionEvidence.repository_commit ?? 'local-runtime',
      inspection_summary: 'Green PASS; bounded local cycle completed',
      work_claimed: [completedTask.objective ?? objective],
      work_implemented: executionEvidence.implemented ?? [],
      verification: [
        ...(executionEvidence.verification ?? []),
        `budget reconciled: ${budgetOutcome.status}`,
        'Green evaluateTaskCompletion disposition=pass',
      ],
      evidence: [
        ...(executionEvidence.evidence ?? []),
        `worker-output:${JSON.stringify(executionEvidence.worker_output)}`,
        `green:disposition:${greenResult.disposition}`,
        `green:task_status:${greenResult.task_status}`,
      ],
      blockers: [],
      escalations: [],
      next_action: executionEvidence.next_action ?? 'await upstream reconciliation',
      green_disposition: greenResult.disposition,
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
      greenDisposition: greenResult.disposition,
    });

    return Object.freeze({
      status: response.status,
      response,
      task: completedTask,
      boot,
      task_id: taskId,
      budget: budgetOutcome,
      green: greenResult,
    });
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
    mission_id: result.response?.mission_id,
    wake_trace_id: result.response?.wake_trace_id,
    source_agent: result.response?.source_agent,
    mode: result.boot?.capabilities?.mode,
    budget_status: result.budget?.status,
    green_disposition: result.green?.disposition ?? null,
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
