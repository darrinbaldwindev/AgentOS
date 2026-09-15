import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMission011Fixture,
  proveParallelEligibility,
  proveDependencyOrdering,
  proveConcurrencyLimits,
  proveDuplicateClaimPrevention,
  proveConflictReconciliation,
  proveEvidenceCorrelation,
  proveCheckpointRecovery
} from '../fixtures/mission-011-deterministic-fixture.mjs';

test('Mission 011 - Proof 1: Multiple independent tasks can progress in parallel', () => {
  const result = proveParallelEligibility(createMission011Fixture());
  assert.ok(result.proved);
  assert.equal(result.parallelCapacity, 3);
  assert.deepEqual(result.eligibleTaskIds.sort(), ['task-code-001', 'task-code-002', 'task-security-001'].sort());
  assert.equal(result.roles.length, 2);
});

test('Mission 011 - Proof 2: Dependency ordering is enforced', () => {
  const result = proveDependencyOrdering(createMission011Fixture());
  assert.ok(result.proved);
  assert.equal(result.blockedBy.length, 2);
  assert.equal(result.totalDependencies, 3);
  assert.ok(result.blockedBy.includes('task-code-002'));
  assert.ok(result.blockedBy.includes('task-security-001'));
});

test('Mission 011 - Proof 3: Concurrency and budget limits are enforced', () => {
  const result = proveConcurrencyLimits(createMission011Fixture());
  assert.ok(result.proved);
  assert.equal(result.allowedTasks, 3);
  assert.ok(result.attemptedTasks > result.allowedTasks);
  assert.ok(result.withinBudget);
  assert.equal(result.budgetConsumed, 300);
  assert.equal(result.totalBudget, 500);
});

test('Mission 011 - Proof 4: Duplicate-claim prevention works', () => {
  const result = proveDuplicateClaimPrevention(createMission011Fixture());
  assert.ok(result.proved);
  assert.ok(result.firstClaimSuccess);
  assert.ok(result.secondClaimBlocked);
  assert.ok(result.claimId);
});

test('Mission 011 - Proof 5: Conflict reconciliation occurs', () => {
  const result = proveConflictReconciliation();
  assert.ok(result.proved);
  assert.equal(result.status, 'CONFLICT');
  assert.equal(result.evidenceCount, 3);
  assert.ok(result.hasConflict);
});

test('Mission 011 - Proof 6: Evidence is correlated to mission/task/execution', () => {
  const fixture = createMission011Fixture();
  const result = proveEvidenceCorrelation(fixture);
  assert.ok(result.proved);
  assert.equal(result.missionId, fixture.missionId);
  assert.ok(result.taskId.startsWith('task-'));
  assert.ok(result.executionId.startsWith('exec-'));
  assert.equal(result.evidence.status, 'verified');
  assert.equal(result.evidence.type, 'test');
});

test('Mission 011 - Proof 7: Recovery from last valid checkpoint succeeds', () => {
  const result = proveCheckpointRecovery(createMission011Fixture());
  assert.ok(result.proved);
  assert.ok(result.recovered);
  assert.ok(result.checkpointExists);
  assert.ok(result.stateMatches);
  assert.equal(result.nextAction, 'dispatch-parallel-workers');
  assert.ok(Array.isArray(result.recoveredContext.completedTasks));
  assert.ok(Array.isArray(result.recoveredContext.eligibleTasks));
});

test('Mission 011 - Complete fixture creation and structure', () => {
  const fixture = createMission011Fixture();
  assert.ok(fixture.missionId);
  assert.equal(fixture.tasks.length, 6);
  assert.ok(fixture.checkpointStore);
  assert.ok(fixture.startTime);
  const research = fixture.tasks.find(t => t.task_id === 'task-research-001');
  assert.equal(research.dependencies.length, 0);
  const testTask = fixture.tasks.find(t => t.task_id === 'task-test-001');
  assert.equal(testTask.dependencies.length, 3);
});
