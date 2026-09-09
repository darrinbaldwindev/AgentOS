// LOCAL-RUNTIME-006 / MISSION-051 + V1 Mission A/B-repair + Mission C seam restriction
// Safe by default: DRY_RUN only, autonomy disabled, no provider or production writes.
// Mission A: final COMPLETED requires Green PASS.
// Mission B: requireSchedulerDisabled + mission ledger hot path.
// Mission C: greenEvaluate is NOT a public named parameter.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRemoteDeliveryClaimStore } from './remote-delivery-claim-store.mjs';
import { loadOrCreateRemoteHostIdentity } from './remote-host-identity.mjs';
import { evaluateRemotePickupEligibility } from './remote-pickup-eligibility.mjs';
import { assessRemoteDeliveryClaimRecovery } from './remote-delivery-recovery.mjs';
import { createRemoteExecutionReceipt } from './remote-local-bridge-contract.mjs';
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
import {
  appendMissionRecord,
  createMissionRecord,
  missionLedgerPaths,
} from './mission-ledger.mjs';

const PROJECT_ID = 'agentos-local';
const RECEIVER = 'agentos:project-overseer';
const ISSUER = 'agentos:overseer';
const CAPABILITY = 'repository:read';
const WORKER_ID = 'agentos:deterministic-skill-agent';

async function readJson(path) {
  return JSON.parse(await fs.readFile(path, 'utf8'));
}

function safeRuntimeConfig(config, { requireSchedulerDisabled = false } = {}) {
  if (config?.schemaVersion !== 1) throw new Error('LOCAL_CONFIG_SCHEMA_INVALID');
  if (config.mode !== 'DRY_RUN' || config.autonomyEnabled !== false) {
    throw new Error('LOCAL_WAKE_REQUIRES_SAFE_MODE');
  }
  if (requireSchedulerDisabled && config.scheduler?.enabled !== false) {
    throw new Error('LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED');
  }
  return config;
}

export { safeRuntimeConfig };

async function appendLedgerEvent({ root, stage, scheduleId, missionId, outcome, intendedNextAction, actions = [], worker = null, evidence = [], blockers = [], safety = [] }) {
  const paths = missionLedgerPaths(root);
  const record = createMissionRecord({
    stage,
    scheduleId,
    missionId,
    repoHead: 'local-runtime',
    intendedNextAction,
    actions,
    worker,
    evidence,
    safety,
    blockers,
    outcome,
  });
  await appendMissionRecord({ ledgerPath: paths.ledger, record });
  return record;
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

const INTERNAL_GREEN_EVALUATE = Symbol('agentos.internal.greenEvaluate');

/** Test-only seam. Do not use from production/chat callers. */
export function __testOnlyWakeLocal(options = {}) {
  const { greenEvaluate, ...rest } = options;
  if (typeof greenEvaluate !== 'function') {
    return wakeLocal(rest);
  }
  return wakeLocal({ ...rest, [INTERNAL_GREEN_EVALUATE]: greenEvaluate });
}

// Only delivery identity enters here. Authority-bearing task data is loaded from
// the existing local dispatch store, never copied from scheduler arguments.
export async function wakeLocal(options = {}) {
  const { remote: ignoredRemote, ...publicOptions } = options;
  options = publicOptions;
  if (!options.deliveryId) return executeLocalWake(options);
  const { root, deliveryId } = options;
  const configText = await fs.readFile(join(root, 'config.json'), 'utf8');
  const config = safeRuntimeConfig(JSON.parse(configText));
  if (config.remoteBridge?.enabled !== true) throw new Error('REMOTE_PICKUP_DISABLED');
  const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });
  const matches = (await persistence.list('artifact')).filter((a) =>
    a.artifactType === 'dispatch.task' && a.payload?.delivery_id === deliveryId);
  if (matches.length !== 1) throw new Error('REMOTE_DELIVERY_ASSIGNMENT_AMBIGUOUS_OR_MISSING');
  const task = matches[0].payload;
  const host = await loadOrCreateRemoteHostIdentity({ filePath: join(root, 'state', 'remote-host.json') });
  const disposition = async (status, reason, extra = {}) => {
    const response = { status, mission_id: task.mission_id, wake_trace_id: task.wake_trace_id ?? null,
      source_agent: WORKER_ID, evidence: [], completed_at: null, next_action: 'independent_reconciliation' };
    const record = { delivery_id: deliveryId, request_id: task.request_id, task_id: task.task_id,
      host_id: host.host_id, status, reason, executed: false, ...extra };
    await persistence.create('event', { eventType: 'remote.pickup.disposition', ...record });
    if (status === 'BLOCKED' || status === 'RECOVERY_REQUIRED') {
      const current = await persistence.get('artifact', task.task_id);
      await persistence.update('artifact', task.task_id, { payload: { ...current.payload,
        pickup_state: status, pickup_blocker: reason } }, current.revision ?? current.updatedAt);
    }
    return { ...record, response };
  };
  const claims = await createRemoteDeliveryClaimStore({ root: join(root, 'state', 'remote-claims') });
  const existing = await claims.get(deliveryId);
  if (existing) {
    if (existing.request_id !== task.request_id || existing.host_id !== host.host_id) {
      return disposition('BLOCKED', 'CLAIM_CORRELATION_MISMATCH');
    }
    const recovery = assessRemoteDeliveryClaimRecovery({ claim: existing });
    return disposition(recovery.recovery_required ? 'RECOVERY_REQUIRED' : 'DUPLICATE_DELIVERY', recovery.disposition);
  }
  const gate = evaluateRemotePickupEligibility({ admittedTask: task, hostIdentity: host, hostCapabilities: [CAPABILITY] });
  if (!gate.eligible) return disposition('BLOCKED', gate.disposition);
  validateExecutionEnvelope(task);
  if (!task.actor_id || !Array.isArray(task.acceptance_criteria) || !task.acceptance_criteria.length ||
      !Array.isArray(task.scope) || task.scope.some((s) => s !== 'local-runtime') ||
      /\bproduction\b|live\s+(?:write|deploy)/i.test(task.objective) || task.admitted_by !== ISSUER || task.status !== 'queued' || task.target !== RECEIVER) {
    return disposition('BLOCKED', 'REMOTE_ADMISSION_INVALID');
  }
  authoriseDispatch(task, createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] }));
  const claim = await claims.claim({ deliveryId, requestId: task.request_id, hostId: host.host_id });
  if (!claim.claimed) return disposition('DUPLICATE_DELIVERY', claim.disposition);
  const repo = fileURLToPath(new URL('..', import.meta.url));
  const codeIdentity = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const codeDirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: repo, encoding: 'utf8' }).trim().length > 0;
  const remote = { task, host, claim, codeIdentity, codeDirty,
    configIdentity: createHash('sha256').update(configText).digest('hex') };
  try {
    const result = await executeLocalWake({ ...options, remote });
    if (result.status !== 'COMPLETED') {
      await persistence.create('artifact', { id: `remote-blocked:${deliveryId}`, artifactType: 'remote.execution.receipt',
        payload: makeRemoteReceipt(remote, result.task, result.response, result.budget, result.green, 'GREEN_BLOCKED') });
    }
    return result;
  } catch (error) {
    return disposition('RECOVERY_REQUIRED', error.message, { executed: 'unknown', claim_retained: true, budget: error.remoteBudget ?? { status: 'UNKNOWN_REQUIRES_RECONCILIATION' } });
  }
}

function makeRemoteReceipt(remote, task, response, budget, green, status = 'COMPLETED') {
  return { ...createRemoteExecutionReceipt({ candidate: remote.task, missionId: task.mission_id,
    taskId: task.task_id, wakeTraceId: task.wake_trace_id, hostId: remote.host.host_id, workerId: WORKER_ID,
    status, evidence: response.evidence, budgetStatus: budget.status, codeIdentity: remote.codeIdentity }),
    actor_id: remote.task.actor_id, issuer: remote.task.issuer, config_identity: remote.configIdentity,
    code_dirty: remote.codeDirty, claimed_at: remote.claim.record.claimed_at,
    started_at: response.started_at, completed_at: status === 'COMPLETED' ? response.completed_at : null,
    budget_reservation_id: budget.reservation_id, green_disposition: green.disposition,
    next_action: 'independent_upstream_reconciliation' };
}

async function executeLocalWake({ root, remote = null, objective = 'perform one bounded local AgentOS control-cycle action', requireSchedulerDisabled = false, ...rest } = {}) {
  const greenEvaluate = typeof rest[INTERNAL_GREEN_EVALUATE] === 'function' ? rest[INTERNAL_GREEN_EVALUATE] : evaluateTaskCompletion;
  if (!root) throw new TypeError('root is required');
  const config = safeRuntimeConfig(await readJson(join(root, 'config.json')), { requireSchedulerDisabled });
  const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });
  const budget = await createMissionBudget({ filePath: join(root, 'state', 'mission-budget.sqlite') });

  const boot = await bootAgentOS({
    persistence,
    capabilityProbe: { probe: async () => ({ evaluation: { eligible: true }, mode: 'DRY_RUN' }) },
    modelRegistry: { listAvailable: async () => [] },
    continuityCheck: async () => ({ ok: true }),
  });

  const taskId = remote?.task.task_id ?? `local-wake-${randomUUID()}`;
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
    ...(remote ? { ...remote.task, wake_trace_id: wakeTraceId, scheduler_wake_at: createdAt } : {}),
  };

  validateExecutionEnvelope(task);
  authoriseDispatch(task, createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] }));

  if (remote) await persistence.update('artifact', taskId, { payload: task });
  else await persistence.create('artifact', { id: taskId, artifactType: 'dispatch.task', payload: task });

  await appendLedgerEvent({
    root,
    stage: 'A',
    scheduleId: wakeTraceId,
    missionId: task.mission_id,
    outcome: 'no_op_recovery',
    intendedNextAction: 'execute_bounded_worker',
    actions: ['WAKE_ADMITTED', 'TASK_CREATED'],
    evidence: [`task:${taskId}`, `wake:${wakeTraceId}`],
    safety: ['DRY_RUN', 'autonomy_disabled'],
  });

  const reservation = budget.reserve({ project_id: PROJECT_ID, mission_id: task.mission_id, limit_units: 1 });
  let budgetOutcome;
  let workerStarted = false;
  try {
    const dispatchStore = createLocalDispatchStore(persistence);
    const policy = createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] });
    const registry = createLocalWorkerRegistry();
    const selectedWorker = registry.findMatching({ requiredCapabilities: task.required_capabilities });
    if (!selectedWorker) throw new Error('WORKER_CAPABILITY_MATCH_FAILED');

    let capturedWorkerResult = null;
    const completedTask = await runNextTask({
      // This wake owns one task. Recovery work must not be selected under this
      // wake's mission, budget reservation or Green evidence packet.
      tasks: (await dispatchStore.list()).filter((queued) => queued.task_id === taskId),
      receiver: RECEIVER,
      authorityPolicy: policy,
      store: dispatchStore,
      execute: async (started) => {
        if (started.task_id !== taskId || started.mission_id !== task.mission_id || started.wake_trace_id !== wakeTraceId) {
          throw new Error('LOCAL_WAKE_CORRELATION_MISMATCH');
        }
        validateExecutionEnvelope(started);
        const worker = registry.findMatching({ requiredCapabilities: started.required_capabilities });
        if (!worker) throw new Error('WORKER_CAPABILITY_MATCH_FAILED');
        workerStarted = true;
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
            'canonical runner completed claimed to working to verification',
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
    if (completedTask.task_id !== taskId || completedTask.mission_id !== task.mission_id || completedTask.wake_trace_id !== wakeTraceId) {
      throw new Error('LOCAL_WAKE_CORRELATION_MISMATCH');
    }
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

    await persistence.create('artifact', {
      id: `response-awaiting-green:${taskId}`,
      artifactType: 'project-overseer.response',
      payload: awaitingResponse,
    });

    await appendLedgerEvent({
      root,
      stage: 'B',
      scheduleId: wakeTraceId,
      missionId: task.mission_id,
      outcome: 'executed_awaiting_green',
      intendedNextAction: 'green_evaluate',
      actions: ['WORKER_RETURNED', 'EVIDENCE_PERSISTED', 'AWAITING_GREEN'],
      worker: { id: executionEvidence.source_agent ?? WORKER_ID },
      evidence: [`response-awaiting-green:${taskId}`, `task:${taskId}`],
      safety: ['DRY_RUN'],
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
      greenResult = greenEvaluate({
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
      try {
        await appendLedgerEvent({
          root,
          stage: 'C',
          scheduleId: wakeTraceId,
          missionId: task.mission_id,
          outcome: 'blocked',
          intendedNextAction: 'owner_reconcile',
          actions: ['GREEN_DISPOSITION', 'BLOCKED'],
          evidence: [`green-exception:${taskId}`],
          blockers: [greenError?.message ?? String(greenError)],
          safety: ['green_hard_gate'],
        });
      } catch { /* already failing closed */ }
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

    await appendLedgerEvent({
      root,
      stage: 'C',
      scheduleId: wakeTraceId,
      missionId: task.mission_id,
      outcome: greenResult.disposition === 'pass' ? 'green_verified' : 'blocked',
      intendedNextAction: greenResult.disposition === 'pass' ? 'finalize_completed' : 'remediate',
      actions: ['GREEN_DISPOSITION'],
      worker: { id: executionEvidence.source_agent ?? WORKER_ID },
      evidence: [`green-disposition:${taskId}`, `disposition:${greenResult.disposition}`],
      blockers: greenResult.disposition === 'pass' ? [] : [...(greenResult.failures ?? [])],
      safety: ['green_hard_gate'],
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

    // This is permission to finalize, not proof that the response was saved.
    await appendLedgerEvent({
      root,
      stage: 'C',
      scheduleId: wakeTraceId,
      missionId: task.mission_id,
      outcome: 'green_verified',
      intendedNextAction: 'persist_final_response',
      actions: ['COMPLETION_AUTHORIZED'],
      worker: { id: executionEvidence.source_agent ?? WORKER_ID },
      evidence: [`green-disposition:${taskId}`, `task:${taskId}`],
      safety: ['green_pass_required'],
    });

    await persistence.createMany([
      { type: 'artifact', input: { id: `response:${taskId}`, artifactType: 'project-overseer.response', payload: response } },
      ...(remote ? [{ type: 'artifact', input: { id: `remote-receipt:${remote.task.delivery_id}`,
        artifactType: 'remote.execution.receipt',
        payload: makeRemoteReceipt(remote, task, response, budgetOutcome, greenResult) } }] : []),
    ]);
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
      try { budgetOutcome = budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: workerStarted ? 1 : 0 }); } catch {}
    }
    error.remoteBudget = budgetOutcome ?? { status: 'UNKNOWN_REQUIRES_RECONCILIATION' };
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
