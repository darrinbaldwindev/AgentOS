// AGENTOS-WINDOWS-WORKER-005
// Supervised physical-Windows acceptance boundary.
// This module does not enable local-wake, scheduler pickup, remote execution,
// elevation, unrestricted PowerShell, or production autonomy.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createWindowsPowerShellAdapter } from './windows-powershell-adapter.mjs';

export const PHYSICAL_ACCEPTANCE_READ_OPERATIONS = Object.freeze([
  'repo.status',
  'process.list',
  'service.list',
]);

export const PHYSICAL_ACCEPTANCE_DEV_OPERATIONS = Object.freeze([
  'test.run',
]);

function acceptanceError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function defaultHeadResolver(root) {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    timeout: 5_000,
  }).trim();
}

function defaultDirtyResolver(root) {
  return execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    timeout: 5_000,
  }).trim().length > 0;
}

function assertExactHead(expectedHead, actualHead) {
  if (typeof expectedHead !== 'string' || !/^[a-f0-9]{40}$/u.test(expectedHead)) {
    throw acceptanceError('PHYSICAL_ACCEPTANCE_EXACT_HEAD_REQUIRED');
  }
  if (actualHead !== expectedHead) {
    throw acceptanceError('PHYSICAL_ACCEPTANCE_HEAD_MISMATCH');
  }
}

export async function runWindowsPowerShellPhysicalAcceptance({
  root,
  expectedHead,
  acknowledgePhysicalRun = false,
  includeDevExecution = false,
  acknowledgeDevExecution = false,
  expectedExecutables = null,
  platform = process.platform,
  headResolver = defaultHeadResolver,
  dirtyResolver = defaultDirtyResolver,
  adapterFactory = createWindowsPowerShellAdapter,
  now = () => new Date(),
} = {}) {
  if (platform !== 'win32') throw acceptanceError('PHYSICAL_ACCEPTANCE_WINDOWS_REQUIRED');
  if (acknowledgePhysicalRun !== true) throw acceptanceError('PHYSICAL_ACCEPTANCE_OWNER_ACK_REQUIRED');
  if (typeof root !== 'string' || !root.trim()) throw new TypeError('root is required');
  if (typeof headResolver !== 'function') throw new TypeError('headResolver must be a function');
  if (typeof dirtyResolver !== 'function') throw new TypeError('dirtyResolver must be a function');
  if (typeof adapterFactory !== 'function') throw new TypeError('adapterFactory must be a function');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (includeDevExecution === true && acknowledgeDevExecution !== true) {
    throw acceptanceError('PHYSICAL_ACCEPTANCE_DEV_ACK_REQUIRED');
  }

  const repoRoot = resolve(root);
  const actualHead = String(await headResolver(repoRoot)).trim();
  assertExactHead(expectedHead, actualHead);
  if (await dirtyResolver(repoRoot)) throw acceptanceError('PHYSICAL_ACCEPTANCE_TRACKED_TREE_DIRTY');

  const adapter = adapterFactory({ allowedRoots: [repoRoot] });
  const operations = [
    ...PHYSICAL_ACCEPTANCE_READ_OPERATIONS,
    ...(includeDevExecution ? PHYSICAL_ACCEPTANCE_DEV_OPERATIONS : []),
  ];

  const startedAt = now();
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    throw acceptanceError('PHYSICAL_ACCEPTANCE_CLOCK_INVALID');
  }

  const results = [];
  for (const operation of operations) {
    const described = adapter.describe(operation);
    const result = await adapter.execute({
      operation,
      cwd: repoRoot,
      expectedExecutables,
    });
    results.push(Object.freeze({
      operation,
      capability: described.capability,
      elevated: described.elevated,
      interactive: described.interactive,
      result,
    }));
  }

  const finishedAt = now();
  if (!(finishedAt instanceof Date) || Number.isNaN(finishedAt.getTime()) || finishedAt < startedAt) {
    throw acceptanceError('PHYSICAL_ACCEPTANCE_CLOCK_INVALID');
  }

  const pass = results.every((entry) =>
    entry.elevated === false &&
    entry.interactive === false &&
    entry.result?.success === true &&
    entry.result?.elevated === false &&
    entry.result?.interactive === false &&
    entry.result?.timed_out === false &&
    entry.result?.truncated === false
  );

  return Object.freeze({
    schema: 'agentos.windows-powershell-physical-acceptance.v1',
    exact_head: actualHead,
    platform,
    repo_root: repoRoot,
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    include_dev_execution: includeDevExecution === true,
    operations: Object.freeze([...operations]),
    results: Object.freeze(results),
    pass,
    local_wake_execution_enabled: false,
    scheduler_execution_enabled: false,
    production_autonomy_enabled: false,
    owner_supervision_required: true,
    disposition: pass ? 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS' : 'PHYSICAL_POWERSHELL_ACCEPTANCE_FAIL',
  });
}
