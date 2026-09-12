// AGENTOS-WINDOWS-WORKER-001
// Level-1 governed Windows worker adapter. This is a capability adapter only;
// it does not grant authority, schedule work, elevate privileges, or bypass Green/PRS.

import { execFile as execFileCallback, execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';

const OPERATIONS = Object.freeze({
  'repo.status': { capability: 'shell.powershell.repo.read', tool: 'git.exe', toolArgs: 'status --short --branch' },
  'repo.diff': { capability: 'shell.powershell.repo.read', tool: 'git.exe', toolArgs: 'diff --no-ext-diff' },
  'test.run': { capability: 'shell.powershell.dev.execute', tool: 'npm.cmd', toolArgs: 'test' },
  'audit.run': { capability: 'shell.powershell.dev.execute', tool: 'npm.cmd', toolArgs: 'audit --audit-level=high --omit=dev' },
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

function terminateWindowsProcessTree(child) {
  if (!child || !Number.isInteger(child.pid) || child.pid <= 0) return false;
  try {
    execFileSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      windowsHide: true,
      stdio: 'ignore',
      timeout: 5_000,
    });
    return true;
  } catch {
    try {
      return child.kill('SIGTERM');
    } catch {
      return false;
    }
  }
}

function firstLine(value) {
  return String(value ?? '').split(/\r?\n/u).map((line) => line.trim()).find(Boolean) ?? '';
}

function executableVersion(executablePath, tool) {
  const common = { windowsHide: true, encoding: 'utf8', timeout: 5_000, stdio: ['ignore', 'pipe', 'pipe'] };
  try {
    if (tool === 'powershell.exe') {
      return firstLine(execFileSync(executablePath, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()'], common));
    }
    return firstLine(execFileSync(executablePath, ['--version'], common));
  } catch {
    return null;
  }
}

function defaultToolResolver(tool) {
  if (process.platform !== 'win32') return Object.freeze({ path: tool, version: null });
  try {
    const located = firstLine(execFileSync('where.exe', [tool], {
      windowsHide: true,
      encoding: 'utf8',
      timeout: 5_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }));
    if (!located) throw new Error('not found');
    const executablePath = realpathSync.native(located);
    return Object.freeze({ path: executablePath, version: executableVersion(executablePath, tool) });
  } catch {
    const error = new Error(`POWERSHELL_EXECUTABLE_RESOLUTION_FAILED:${tool}`);
    error.code = 'POWERSHELL_EXECUTABLE_RESOLUTION_FAILED';
    throw error;
  }
}

function quotePowerShellLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function buildScript(spec, resolvedTools) {
  if (!spec.tool) return spec.script;
  const tool = resolvedTools[spec.tool];
  if (!tool?.path) throw new Error(`POWERSHELL_EXECUTABLE_RESOLUTION_FAILED:${spec.tool}`);
  return `& ${quotePowerShellLiteral(tool.path)} ${spec.toolArgs}`;
}

async function defaultExecutor({ executable, args, cwd, timeoutMs, maxBuffer }) {
  return await new Promise((resolve, reject) => {
    let timedOut = false;
    let timer = null;
    const child = execFileCallback(
      executable,
      args,
      { cwd, windowsHide: true, maxBuffer, encoding: 'utf8' },
      (error, stdout = '', stderr = '') => {
        if (timer) clearTimeout(timer);
        if (error) {
          error.stdout = error.stdout ?? stdout;
          error.stderr = error.stderr ?? stderr;
          if (timedOut) {
            error.killed = true;
            error.signal = error.signal ?? 'SIGTERM';
          }
          reject(error);
          return;
        }
        if (timedOut) {
          const timeoutError = new Error('POWERSHELL_PROCESS_TIMEOUT');
          timeoutError.code = null;
          timeoutError.killed = true;
          timeoutError.signal = 'SIGTERM';
          timeoutError.stdout = stdout;
          timeoutError.stderr = stderr;
          reject(timeoutError);
          return;
        }
        resolve({ stdout, stderr, exitCode: 0 });
      }
    );

    timer = setTimeout(() => {
      timedOut = true;
      terminateWindowsProcessTree(child);
    }, timeoutMs);
  });
}

export function createWindowsPowerShellAdapter({
  allowedRoots,
  executor = defaultExecutor,
  pathResolver = defaultPathResolver,
  pathModule = path,
  toolResolver = defaultToolResolver,
  timeoutMs = 120_000,
  maxBuffer = 1_048_576,
  now = () => Date.now(),
} = {}) {
  if (!Array.isArray(allowedRoots) || allowedRoots.length === 0) throw new TypeError('allowedRoots must be non-empty');
  if (typeof executor !== 'function') throw new TypeError('executor must be a function');
  if (typeof pathResolver !== 'function') throw new TypeError('pathResolver must be a function');
  if (typeof toolResolver !== 'function') throw new TypeError('toolResolver must be a function');
  if (!pathModule || typeof pathModule.resolve !== 'function' || typeof pathModule.relative !== 'function' || typeof pathModule.isAbsolute !== 'function') {
    throw new TypeError('pathModule must provide resolve, relative, and isAbsolute');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new TypeError('timeoutMs must be a positive integer');
  if (!Number.isInteger(maxBuffer) || maxBuffer < 1) throw new TypeError('maxBuffer must be a positive integer');
  if (typeof now !== 'function') throw new TypeError('now must be a function');

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
    const startedMs = now();
    if (!Number.isFinite(startedMs)) throw new Error('POWERSHELL_CLOCK_INVALID');
    const startedAt = new Date(startedMs).toISOString();
    let resolvedTools = {};
    try {
      const powershell = await toolResolver('powershell.exe');
      if (!powershell?.path) throw new Error('POWERSHELL_EXECUTABLE_RESOLUTION_FAILED:powershell.exe');
      resolvedTools = { 'powershell.exe': Object.freeze({ path: String(powershell.path), version: powershell.version == null ? null : String(powershell.version) }) };
      if (spec.tool) {
        const operationTool = await toolResolver(spec.tool);
        if (!operationTool?.path) throw new Error(`POWERSHELL_EXECUTABLE_RESOLUTION_FAILED:${spec.tool}`);
        resolvedTools[spec.tool] = Object.freeze({ path: String(operationTool.path), version: operationTool.version == null ? null : String(operationTool.version) });
      }
      resolvedTools = Object.freeze({ ...resolvedTools });
      const script = buildScript(spec, resolvedTools);
      const result = await executor({ executable: resolvedTools['powershell.exe'].path, args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'RemoteSigned', '-Command', script], cwd: safeCwd, timeoutMs, maxBuffer });
      const finishedMs = now();
      if (!Number.isFinite(finishedMs) || finishedMs < startedMs) throw new Error('POWERSHELL_CLOCK_INVALID');
      const exitCode = Number.isInteger(result?.exitCode) ? result.exitCode : 0;
      const finishedAt = new Date(finishedMs).toISOString();
      return Object.freeze({
        operation,
        capability: spec.capability,
        cwd: safeCwd,
        elevated: false,
        interactive: false,
        started_at: startedAt,
        finished_at: finishedAt,
        completed_at: finishedAt,
        duration_ms: finishedMs - startedMs,
        exit_code: exitCode,
        stdout: String(result?.stdout ?? ''),
        stderr: String(result?.stderr ?? ''),
        timed_out: false,
        truncated: false,
        resolved_executables: resolvedTools,
        success: exitCode === 0,
      });
    } catch (error) {
      const result = error ?? {};
      const finishedMsRaw = now();
      const finishedMs = Number.isFinite(finishedMsRaw) && finishedMsRaw >= startedMs ? finishedMsRaw : startedMs;
      const finishedAt = new Date(finishedMs).toISOString();
      const timedOut = result.killed === true && result.signal != null;
      const truncated = result.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
      return Object.freeze({
        operation,
        capability: spec.capability,
        cwd: safeCwd,
        elevated: false,
        interactive: false,
        started_at: startedAt,
        finished_at: finishedAt,
        completed_at: finishedAt,
        duration_ms: finishedMs - startedMs,
        exit_code: Number.isInteger(result.code) ? result.code : null,
        stdout: String(result.stdout ?? ''),
        stderr: String(result.stderr ?? result.message ?? ''),
        timed_out: timedOut,
        truncated,
        resolved_executables: Object.freeze({ ...resolvedTools }),
        success: false,
      });
    }
  }

  return Object.freeze({ describe, execute, operations: Object.freeze(Object.keys(OPERATIONS)) });
}
