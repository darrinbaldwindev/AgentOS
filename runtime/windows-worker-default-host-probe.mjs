// AGENTOS-WINDOWS-WORKER-003
// Production-default evidence adapter for the bounded Windows worker host probe.
// This module performs fixed read-only discovery only. It grants no task authority
// and never executes a user-supplied command.

import { execFile } from 'node:child_process';
import { constants, promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { createWindowsWorkerHostProbe } from './windows-worker-host-probe.mjs';

const COMMAND_TIMEOUT_MS = 5_000;

function firstLine(value) {
  return String(value ?? '').split(/\r?\n/u).map((line) => line.trim()).find(Boolean) ?? '';
}

function execFixed(execFileImpl, executable, args) {
  return new Promise((resolveResult) => {
    execFileImpl(
      executable,
      args,
      { windowsHide: true, timeout: COMMAND_TIMEOUT_MS, encoding: 'utf8' },
      (error, stdout = '') => resolveResult({ ok: error == null, stdout: String(stdout ?? '') }),
    );
  });
}

async function probeFixedCommand({ platform, execFileImpl, fsRealpath, tool }) {
  if (platform !== 'win32') return false;
  const located = await execFixed(execFileImpl, 'where.exe', [tool]);
  const rawPath = firstLine(located.stdout);
  if (!located.ok || !rawPath) return false;

  let executablePath;
  try {
    executablePath = await fsRealpath(rawPath);
  } catch {
    return false;
  }

  const versionArgs = tool === 'powershell.exe'
    ? ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()']
    : ['--version'];
  const versionResult = await execFixed(execFileImpl, executablePath, versionArgs);

  return Object.freeze({
    available: true,
    path: executablePath,
    version: versionResult.ok ? firstLine(versionResult.stdout) || null : null,
  });
}

async function canAccess(fsAccess, workspaceRoot, mode) {
  try {
    await fsAccess(workspaceRoot, mode);
    return true;
  } catch {
    return false;
  }
}

export function createDefaultWindowsWorkerHostProbe({
  workspaceRoot,
  platform = process.platform,
  execFileImpl = execFile,
  fsAccess = fs.access,
  fsRealpath = fs.realpath,
} = {}) {
  if (typeof workspaceRoot !== 'string' || workspaceRoot.length === 0) {
    throw new TypeError('workspaceRoot is required');
  }
  if (typeof execFileImpl !== 'function') throw new TypeError('execFileImpl must be a function');
  if (typeof fsAccess !== 'function') throw new TypeError('fsAccess must be a function');
  if (typeof fsRealpath !== 'function') throw new TypeError('fsRealpath must be a function');

  const canonicalWorkspaceRoot = resolve(workspaceRoot);
  return createWindowsWorkerHostProbe({
    platform,
    commandProbe: (tool) => probeFixedCommand({ platform, execFileImpl, fsRealpath, tool }),
    workspaceProbe: async () => ({
      readable: await canAccess(fsAccess, canonicalWorkspaceRoot, constants.R_OK),
      writable: await canAccess(fsAccess, canonicalWorkspaceRoot, constants.W_OK),
    }),
  });
}
