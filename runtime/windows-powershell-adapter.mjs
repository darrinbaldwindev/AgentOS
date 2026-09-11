// AGENTOS-WINDOWS-WORKER-001
// Level-1 governed Windows worker adapter. This is a capability adapter only;
// it does not grant authority, schedule work, elevate privileges, or bypass Green/PRS.

import { execFile as execFileCallback } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const OPERATIONS = Object.freeze({
  'repo.status': { capability: 'shell.powershell.repo.read', script: 'git status --short --branch' },
  'repo.diff': { capability: 'shell.powershell.repo.read', script: 'git diff --no-ext-diff' },
  'test.run': { capability: 'shell.powershell.dev.execute', script: 'npm test' },
  'audit.run': { capability: 'shell.powershell.dev.execute', script: 'npm audit --audit-level=high --omit=dev' },
  'process.list': { capability: 'shell.powershell.system.read', script: 'Get-Process | Select-Object -First 200 Id,ProcessName,CPU,WorkingSet64 | ConvertTo-Json -Compress' },
  'service.list': { capability: 'shell.powershell.system.read', script: 'Get-Service | Select-Object -First 200 Name,Status,StartType | ConvertTo-Json -Compress' },
});

const defaultPathResolver = (input) => realpathSync.native(input);

function canonicalizePath(input, pathResolver, pathModule, errorCode) {
  try {
    return pathModule.resolve(pathResolver(pathModule.resolve(input)));
  } catch {
    throw new Error(errorCode);
  }
}

function assertAllowedRoot(cwd, allowedRoots, pathResolver, pathModule) {
  const target = canonicalizePath(cwd, pathResolver, pathModule, 'POWERSHELL_PATH_CANONICALIZATION_FAILED');
  const canonicalRoots = allowedRoots.map((root) =>
    canonicalizePath(root, pathResolver, pathModule, 'POWERSHELL_ALLOWED_ROOT_CANONICALIZATION_FAILED')
  );
  const allowed = canonicalRoots.some((base) => {
    const rel = pathModule.relative(base, target);
    return rel === '' || (!rel.startsWith('..') && !pathModule.isAbsolute(rel));
  });
  if (!allowed) throw new Error('POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT');
  return target;
}

async function defaultExecutor({ executable, args, cwd, timeoutMs, maxBuffer }) {
  const result = await execFile(executable, args, { cwd, windowsHide: true, timeout: timeoutMs, maxBuffer, encoding: 'utf8' });
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '', exitCode: 0 };
}

export function createWindowsPowerShellAdapter({
  allowedRoots,
  executor = defaultExecutor,
  pathResolver = defaultPathResolver,
  pathModule = path,
  executable = 'powershell.exe',
  timeoutMs = 120_000,
  maxBuffer = 1_048_576,
} = {}) {
  if (!Array.isArray(allowedRoots) || allowedRoots.length === 0) throw new TypeError('allowedRoots must be non-empty');
  if (typeof executor !== 'function') throw new TypeError('executor must be a function');
  if (typeof pathResolver !== 'function') throw new TypeError('pathResolver must be a function');
  if (!pathModule || typeof pathModule.resolve !== 'function' || typeof pathModule.relative !== 'function' || typeof pathModule.isAbsolute !== 'function') {
    throw new TypeError('pathModule must provide resolve, relative, and isAbsolute');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new TypeError('timeoutMs must be a positive integer');
  if (!Number.isInteger(maxBuffer) || maxBuffer < 1) throw new TypeError('maxBuffer must be a positive integer');

  function describe(operation) {
    const spec = OPERATIONS[operation];
    if (!spec) throw new Error('POWERSHELL_OPERATION_NOT_ALLOWED');
    return Object.freeze({ operation, capability: spec.capability, elevated: false, interactive: false });
  }

  async function execute({ operation, cwd } = {}) {
    const spec = OPERATIONS[operation];
    if (!spec) throw new Error('POWERSHELL_OPERATION_NOT_ALLOWED');
    if (typeof cwd !== 'string' || !cwd) throw new TypeError('cwd is required');
    const safeCwd = assertAllowedRoot(cwd, allowedRoots, pathResolver, pathModule);
    const startedAt = new Date().toISOString();
    try {
      const result = await executor({ executable, args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'RemoteSigned', '-Command', spec.script], cwd: safeCwd, timeoutMs, maxBuffer });
      const exitCode = Number.isInteger(result?.exitCode) ? result.exitCode : 0;
      return Object.freeze({ operation, capability: spec.capability, cwd: safeCwd, elevated: false, interactive: false, started_at: startedAt, completed_at: new Date().toISOString(), exit_code: exitCode, stdout: String(result?.stdout ?? ''), stderr: String(result?.stderr ?? ''), success: exitCode === 0 });
    } catch (error) {
      const result = error ?? {};
      return Object.freeze({ operation, capability: spec.capability, cwd: safeCwd, elevated: false, interactive: false, started_at: startedAt, completed_at: new Date().toISOString(), exit_code: Number.isInteger(result.code) ? result.code : null, stdout: String(result.stdout ?? ''), stderr: String(result.stderr ?? result.message ?? ''), success: false });
    }
  }

  return Object.freeze({ describe, execute, operations: Object.freeze(Object.keys(OPERATIONS)) });
}
