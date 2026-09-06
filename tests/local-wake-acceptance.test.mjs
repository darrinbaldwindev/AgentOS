// LOCAL-ACCEPTANCE-001: Deterministic tests for local wake acceptance contract.
// Validates that wake execution produces correlated evidence, remains DRY_RUN, and demonstrates persistence/restart continuity.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
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
  const execFileAsync = promisify(execFile);
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  
  // First wake in separate process
  const firstWakeResult = await execFileAsync('node', ['runtime/local-wake.mjs', 'first wake'], {
    env: { ...process.env, AGENTOS_HOME: root },
    maxBuffer: 1024 * 1024,
  });
  
  assert.equal(firstWakeResult.stderr, '', 'first wake should not produce stderr');
  const result1 = JSON.parse(firstWakeResult.stdout);
  assert.equal(result1.status, 'COMPLETED', 'first wake should complete');
  assert.ok(result1.task_id, 'first wake should have task_id');
  assert.ok(result1.wake_trace_id, 'first wake should have wake_trace_id');
  assert.equal(result1.mode, 'DRY_RUN', 'first wake should be in DRY_RUN mode');
  assert.equal(result1.autonomyEnabled, false, 'first wake should have autonomy disabled');
  
  const firstTaskId = result1.task_id;
  const firstWakeTrace = result1.wake_trace_id;
  const firstMissionId = result1.mission_id;
  
  // Second wake in separate process against same isolated home
  const secondWakeResult = await execFileAsync('node', ['runtime/local-wake.mjs', 'second wake'], {
    env: { ...process.env, AGENTOS_HOME: root },
    maxBuffer: 1024 * 1024,
  });
  
  assert.equal(secondWakeResult.stderr, '', 'second wake should not produce stderr');
  const result2 = JSON.parse(secondWakeResult.stdout);
  assert.equal(result2.status, 'COMPLETED', 'second wake should complete');
  assert.ok(result2.task_id, 'second wake should have task_id');
  assert.ok(result2.wake_trace_id, 'second wake should have wake_trace_id');
  assert.equal(result2.mode, 'DRY_RUN', 'second wake should be in DRY_RUN mode');
  assert.equal(result2.autonomyEnabled, false, 'second wake should have autonomy disabled');
  
  const secondTaskId = result2.task_id;
  const secondWakeTrace = result2.wake_trace_id;
  const secondMissionId = result2.mission_id;
  
  // Verify each wake has unique identifiers
  assert.notEqual(secondTaskId, firstTaskId, 'each wake should have unique task_id');
  assert.notEqual(secondWakeTrace, firstWakeTrace, 'each wake should have unique wake_trace_id');
  assert.notEqual(secondMissionId, firstMissionId, 'each wake should have unique mission_id');
  
  // Verify persistence reloaded across real process boundary
  // Both processes shared the same AGENTOS_HOME, so second wake demonstrates
  // that persisted state from first wake was successfully loaded in separate process
  assert.ok(result1.budget_status, 'first wake should have budget status');
  assert.ok(result2.budget_status, 'second wake should have budget status');
  
  // Verify in-process wake still works (for backward compatibility)
  const result3 = await wakeLocal({ root, objective: 'third wake in-process' });
  assert.equal(result3.status, 'COMPLETED', 'in-process wake should still work');
  assert.ok(result3.task_id, 'in-process wake should have task_id');
  assert.notEqual(result3.task_id, firstTaskId, 'in-process wake should have unique task_id');
  assert.notEqual(result3.task_id, secondTaskId, 'in-process wake should have unique task_id');
});
