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
  assert.ok(result.task?.task_id, 'task should have task_id');
  assert.ok(result.task?.wake_trace_id, 'task should have wake_trace_id');
  assert.equal(result.task.wake_trace_id, result.response.wake_trace_id, 'task and response should share wake_trace_id');
  assert.ok(result.response.source_agent, 'response should identify source_agent');
  assert.ok(result.response.evidence.length > 0, 'response should contain evidence array');
  assert.ok(result.response.evidence.some(e => e.includes('local:wake:')), 'evidence should include wake trace');
  assert.ok(result.response.evidence.some(e => e.includes('local:task:')), 'evidence should include task reference');
  assert.ok(result.response.evidence.some(e => e.includes('worker:')), 'evidence should include worker reference');
});

test('local wake remains DRY_RUN with autonomy disabled', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  const result = await wakeLocal({ root });
  assert.equal(result.boot.capabilities.mode, 'DRY_RUN', 'boot capabilities should be DRY_RUN');
  assert.equal(result.task.constraints.some(c => c.includes('DRY_RUN')), true, 'task should have DRY_RUN constraint');
  assert.equal(result.task.autonomyEnabled, undefined, 'task should not enable autonomy');
  assert.equal(result.task.scope.includes('production'), false, 'task scope should not include production');
  assert.ok(result.task.constraints.some(c => /no production/i.test(c)), 'task should have no-production constraint');
});

test('persistence boundary maintains continuity across wake cycles', async () => {
  const execFileAsync = promisify(execFile);
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-test-'));
  await installLocal({ root });
  const processEnv = { ...process.env, AGENTOS_HOME: root, NODE_NO_WARNINGS: '1' };
  const firstWakeResult = await execFileAsync('node', ['runtime/local-wake.mjs', 'first wake'], { env: processEnv, maxBuffer: 1024 * 1024 });
  assert.equal(firstWakeResult.stderr, '', 'first wake should not produce stderr');
  const result1 = JSON.parse(firstWakeResult.stdout);
  assert.equal(result1.status, 'COMPLETED', 'first wake should complete');
  assert.ok(result1.task_id, 'first wake should have task_id');
  assert.ok(result1.wake_trace_id, 'first wake should have wake_trace_id');
  assert.equal(result1.mode, 'DRY_RUN', 'first wake should be in DRY_RUN mode');
  assert.equal(result1.autonomyEnabled, false, 'first wake should have autonomy disabled');
  const secondWakeResult = await execFileAsync('node', ['runtime/local-wake.mjs', 'second wake'], { env: processEnv, maxBuffer: 1024 * 1024 });
  assert.equal(secondWakeResult.stderr, '', 'second wake should not produce stderr');
  const result2 = JSON.parse(secondWakeResult.stdout);
  assert.equal(result2.status, 'COMPLETED', 'second wake should complete');
  assert.ok(result2.task_id, 'second wake should have task_id');
  assert.ok(result2.wake_trace_id, 'second wake should have wake_trace_id');
  assert.equal(result2.mode, 'DRY_RUN', 'second wake should be in DRY_RUN mode');
  assert.equal(result2.autonomyEnabled, false, 'second wake should have autonomy disabled');
  assert.notEqual(result2.task_id, result1.task_id, 'each wake should have unique task_id');
  assert.notEqual(result2.wake_trace_id, result1.wake_trace_id, 'each wake should have unique wake_trace_id');
  const state = JSON.parse(await (await import('node:fs/promises')).readFile(join(root, 'state/agentos.json'), 'utf8'));
  const artifacts = Object.values(state.records.artifact);
  assert.equal(artifacts.filter((a) => a.artifactType === 'dispatch.task').length, 2);
  assert.equal(artifacts.filter((a) => a.artifactType === 'project-overseer.response').length, 2);
  assert.equal(Object.values(state.records.event).filter((e) => e.eventType === 'agentos.manual-wake.completed').length, 2);
});
