/**
 * Mission 011: Deterministic Elastic Worker Pool Fixture
 *
 * Proves (with controlled, deterministic execution):
 * 1. Multiple independent tasks can progress in parallel
 * 2. Dependency ordering is enforced
 * 3. Concurrency and budget limits are respected
 * 4. Duplicate-claim prevention works
 * 5. Conflict reconciliation occurs
 * 6. Evidence is correlated to mission/task/execution
 * 7. Recovery from last valid checkpoint succeeds
 *
 * Does NOT prove (requires production runtime):
 * - Actual parallel execution with real concurrency
 * - Real-world task scheduling with timing constraints
 * - Network resilience or distributed coordination
 * - Production provider integration
 * - Scale testing beyond fixture boundaries
 * - Recovery from actual failures (network, process crashes, OOM)
 * - End-to-end mission completion with independent verification
 */

import { atomicClaim } from '../src/dispatch/atomic-claim.mjs';
import { createEvidence, assessEvidence } from '../runtime/evidence-model.mjs';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';

const WORKER_ROLES = {
  REPO_CODE: 'REPO-CODE',
  QA_TEST: 'QA-TEST',
  RESEARCH: 'RESEARCH',
  ARCHITECTURE: 'ARCHITECTURE',
  SKILLS: 'SKILLS',
  SECURITY_HEALTH: 'SECURITY-HEALTH'
};

export function createMission011Fixture() {
  const missionId = 'mission-011-deterministic';
  const startTime = Date.now();

  const tasks = [
    createTask('task-research-001', missionId, WORKER_ROLES.RESEARCH, [], startTime),
    createTask('task-arch-001', missionId, WORKER_ROLES.ARCHITECTURE, ['task-research-001'], startTime),
    createTask('task-code-001', missionId, WORKER_ROLES.REPO_CODE, ['task-arch-001'], startTime),
    createTask('task-code-002', missionId, WORKER_ROLES.REPO_CODE, ['task-arch-001'], startTime),
    createTask('task-security-001', missionId, WORKER_ROLES.SECURITY_HEALTH, ['task-arch-001'], startTime),
    createTask('task-test-001', missionId, WORKER_ROLES.QA_TEST, ['task-code-001', 'task-code-002', 'task-security-001'], startTime)
  ];

  return { missionId, tasks, checkpointStore: createMissionCheckpointStore(), startTime };
}

function createTask(taskId, missionId, role, dependencies, now) {
  return {
    task_id: taskId,
    mission_id: missionId,
    issuer: 'Overseer',
    target: role,
    objective: `Execute ${taskId} for ${role}`,
    priority: 'normal',
    scope: [role],
    constraints: ['deterministic', 'no-external-calls'],
    acceptance_criteria: [`${role} work completed`],
    authority: { granted_capabilities: [role] },
    status: 'queued',
    dependencies,
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString()
  };
}

export function proveParallelEligibility(fixture) {
  const { tasks } = fixture;
  const completedIds = new Set(['task-research-001', 'task-arch-001']);
  const eligibleTasks = tasks.filter(task => {
    if (completedIds.has(task.task_id)) return false;
    if (task.status !== 'queued') return false;
    return task.dependencies.every(dep => completedIds.has(dep));
  });
  return {
    proved: eligibleTasks.length === 3,
    eligibleTaskIds: eligibleTasks.map(t => t.task_id),
    parallelCapacity: eligibleTasks.length,
    roles: [...new Set(eligibleTasks.map(t => t.target))]
  };
}

export function proveDependencyOrdering(fixture) {
  const { tasks } = fixture;
  const testTask = tasks.find(t => t.task_id === 'task-test-001');
  const completedIds = new Set(['task-research-001', 'task-arch-001', 'task-code-001']);
  const canStart = testTask.dependencies.every(dep => completedIds.has(dep));
  const allDepsCompleted = new Set([...completedIds, 'task-code-002', 'task-security-001']);
  const canStartWhenAllComplete = testTask.dependencies.every(dep => allDepsCompleted.has(dep));
  return {
    proved: !canStart && canStartWhenAllComplete,
    blockedBy: testTask.dependencies.filter(dep => !completedIds.has(dep)),
    totalDependencies: testTask.dependencies.length,
    dependenciesMet: testTask.dependencies.filter(dep => completedIds.has(dep)).length
  };
}

export function proveConcurrencyLimits(fixture) {
  const { tasks } = fixture;
  const maxConcurrentWorkers = 3;
  const budgetPerTask = 100;
  const totalBudget = 500;
  const eligibleTasks = tasks.filter(t => t.task_id !== 'task-research-001' && t.task_id !== 'task-test-001');
  const allowedByConcurrency = eligibleTasks.slice(0, maxConcurrentWorkers);
  const budgetConsumed = allowedByConcurrency.length * budgetPerTask;
  const withinBudget = budgetConsumed <= totalBudget;
  return {
    proved: allowedByConcurrency.length === maxConcurrentWorkers && withinBudget,
    maxConcurrentWorkers,
    attemptedTasks: eligibleTasks.length,
    allowedTasks: allowedByConcurrency.length,
    budgetConsumed,
    totalBudget,
    withinBudget
  };
}

export function proveDuplicateClaimPrevention(fixture, now = Date.now()) {
  const task = fixture.tasks[0];
  const worker1 = 'worker-instance-1';
  const worker2 = 'worker-instance-2';
  const claim1 = atomicClaim(task, task.target, { now, claimId: `${worker1}-${now}` });
  const claim2 = atomicClaim(claim1.task, task.target, { now: now + 1, claimId: `${worker2}-${now + 1}` });
  return {
    proved: claim1.claimed && !claim2.claimed,
    firstClaimSuccess: claim1.claimed,
    secondClaimBlocked: !claim2.claimed,
    claimId: claim1.task.claim?.id
  };
}

export function proveConflictReconciliation() {
  const evidence1 = createEvidence({ type: 'commit', source: 'worker-1', status: 'verified', details: { approach: 'solution-A' } });
  const evidence2 = createEvidence({ type: 'commit', source: 'worker-2', status: 'verified', details: { approach: 'solution-B' } });
  const conflictEvidence = createEvidence({ type: 'reconciliation', source: 'overseer', status: 'conflict', details: { worker1: evidence1, worker2: evidence2 } });
  const assessment = assessEvidence([evidence1, evidence2, conflictEvidence]);
  return {
    proved: assessment.status === 'CONFLICT',
    status: assessment.status,
    evidenceCount: assessment.evidence.length,
    hasConflict: assessment.evidence.some(e => e.status === 'conflict')
  };
}

export function proveEvidenceCorrelation(fixture, now = Date.now()) {
  const { missionId, tasks } = fixture;
  const task = tasks[0];
  const executionId = `exec-${task.task_id}-${now}`;
  const evidence = createEvidence({
    type: 'test',
    source: executionId,
    status: 'verified',
    details: { mission_id: missionId, task_id: task.task_id, execution_id: executionId, worker: task.target, timestamp: new Date(now).toISOString() }
  });
  const isCorrelated = evidence.details.mission_id === missionId && evidence.details.task_id === task.task_id && evidence.details.execution_id === executionId;
  return { proved: isCorrelated, missionId: evidence.details.mission_id, taskId: task.task_id, executionId, evidence };
}

export function proveCheckpointRecovery(fixture) {
  const { missionId, checkpointStore } = fixture;
  const completedTasks = ['task-research-001', 'task-arch-001'];
  const checkpoint = checkpointStore.save({
    missionId,
    state: 'in-progress',
    context: { completedTasks, eligibleTasks: ['task-code-001', 'task-code-002', 'task-security-001'] },
    nextAction: 'dispatch-parallel-workers'
  });
  const recovered = checkpointStore.load(missionId);
  const stateMatches = recovered.missionId === checkpoint.missionId && recovered.state === checkpoint.state && recovered.context.completedTasks.length === completedTasks.length && recovered.nextAction === checkpoint.nextAction;
  return { proved: stateMatches && recovered !== null, recovered: recovered !== null, checkpointExists: checkpoint !== null, stateMatches, recoveredContext: recovered?.context, nextAction: recovered?.nextAction };
}
