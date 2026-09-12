// AGENTOS-WINDOWS-WORKER-003
// Production-default evidence adapter for the bounded Windows worker host probe.
// This module performs fixed read-only discovery only. It grants no task authority
// and never executes a user-supplied command.

import { execFile } from 'node:child_process';
import { constants, promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { createWindowsWorkerHostProbe } from './windows-worker-host-probe.mjs';

const COMMAND_TIMEOUT_MS = 5_000;

function probeFixedCommand({ platform, execFileImpl, tool }) {
  if (platform !== 'win32') return Promise.resolve(false);
  return new Promise((done) => {
    execFileImpl(
      'where.exe',
      [tool],
      { windowsHide: true, timeout: COMMAND_TIMEOUT_MS, encoding: 'utf8' },
      (error) => done(error == null),
    );
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
} = {}) {
  if (typeof workspaceRoot !== 'string' || workspaceRoot.length === 0) {
    throw new TypeError('workspaceRoot is required');
  }
  if (typeof execFileImpl !== 'function') throw new TypeError('execFileImpl must be a function');
  if (typeof fsAccess !== 'function') throw new TypeError('fsAccess must be a function');

  const canonicalWorkspaceRoot = resolve(workspaceRoot);
  return createWindowsWorkerHostProbe({
    platform,
    commandProbe: (tool) => probeFixedCommand({ platform, execFileImpl, tool }),
    workspaceProbe: async () => ({
      readable: await canAccess(fsAccess, canonicalWorkspaceRoot, constants.R_OK),
      writable: await canAccess(fsAccess, canonicalWorkspaceRoot, constants.W_OK),
    }),
  });
}
