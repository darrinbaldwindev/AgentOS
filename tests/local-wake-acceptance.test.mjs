// LOCAL-ACCEPTANCE-001: Deterministic tests for local wake acceptance contract.
// Validates that wake execution produces correlated evidence, remains DRY_RUN, and demonstrates persistence/restart continuity.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';

test('local wake produces correlated task/mission/wake evidence', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  
  const result = await wakeLocal({ root, objective: 'test wake evidence correlation' });
  
  assert.equal(result.status, 'COMPLETED', 'wake should complete successfully');
  assert.ok(result.task_id, 'wake should produce task_id');
  assert.ok(result.response.mission_id, 'wake should produce mission_id');
  assert.ok(result.response.wake_trace_id, 'wake should produce wake_trace_id');
  assert.equal(result.response.status, 'COMPLETED', 'response should have COMPLETED status');
  
  // Verify correlation
  assert.ok(result.task?.task_id, 'task should have task_id');
  assert.ok(result.task?.wake_trace_id, 'task should have wake_trace_id');
  assert.equal(result.task.wake_trace_id, result.response.wake_trace_id, 'task and response should share wake_trace_id');
  
  // Verify worker evidence
  assert.ok(result.response.source_agent, 'response should identify source_agent');
  assert.ok(result.response.evidence.length > 0, 'response should contain evidence array');
  const hasWakeEvidence = result.response.evidence.some(e => e.includes('local:wake:'));
  const hasTaskEvidence = result.response.evidence.some(e => e.includes('local:task:'));
  const hasWorkerEvidence = result.response.evidence.some(e => e.includes('worker:'));
  assert.ok(hasWakeEvidence, 'evidence should include wake trace');
  assert.ok(hasTaskEvidence, 'evidence should include task reference');
  assert.ok(hasWorkerEvidence, 'evidence should include worker reference');
});

test('local wake remains DRY_RUN with autonomy disabled', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  
  const result = await wakeLocal({ root });
  
  assert.equal(result.boot.capabilities.mode, 'DRY_RUN', 'boot capabilities should be DRY_RUN');
  assert.equal(result.task.constraints.some(c => c.includes('DRY_RUN')), true, 'task should have DRY_RUN constraint');
  assert.equal(result.task.autonomyEnabled, undefined, 'task should not enable autonomy');
  
  // Verify no production scope
  assert.equal(result.task.scope.includes('production'), false, 'task scope should not include production');
  const hasProductionConstraint = result.task.constraints.some(c => /no production/i.test(c));
  assert.ok(hasProductionConstraint, 'task should have no-production constraint');
});

test('persistence boundary maintains continuity across wake cycles', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  
  const result1 = await wakeLocal({ root, objective: 'first wake' });
  const firstTaskId = result1.task_id;
  const firstWakeTrace = result1.response.wake_trace_id;
  
  assert.equal(result1.status, 'COMPLETED', 'first wake should complete');
  assert.ok(result1.budget.status, 'first wake should have budget status');
  
  // Second wake after persistence boundary
  const result2 = await wakeLocal({ root, objective: 'second wake' });
  const secondTaskId = result2.task_id;
  const secondWakeTrace = result2.response.wake_trace_id;
  
  assert.equal(result2.status, 'COMPLETED', 'second wake should complete');
  assert.notEqual(secondTaskId, firstTaskId, 'each wake should have unique task_id');
  assert.notEqual(secondWakeTrace, firstWakeTrace, 'each wake should have unique wake_trace_id');
});
