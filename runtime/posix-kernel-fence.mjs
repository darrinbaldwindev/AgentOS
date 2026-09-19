// Bounded SG-08 POSIX ownership fence.
//
// The fence is a kernel advisory lock on the already-open parent-directory file
// descriptor for the target namespace. No lock-state file is created or removed.
// Holding the directory fd avoids the dedicated-lock-file rename/recreate race;
// the deliberate tradeoff is conservative serialization of AgentOS project-file
// writes within the same directory.
//
// This module grants no authority and creates no scheduler, ledger, persistence
// or assurance state. The kernel releases the flock when the holder exits/crashes.

import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

export async function acquirePosixKernelFence(namespaceAnchorPath) {
  if (process.platform === 'win32') {
    throw fail('PROJECT_FILE_KERNEL_FENCE_UNSUPPORTED_PLATFORM', { platform: process.platform });
  }
  if (typeof namespaceAnchorPath !== 'string' || namespaceAnchorPath.length === 0) {
    throw new TypeError('namespaceAnchorPath is required');
  }

  const fenceDirectory = path.dirname(path.resolve(namespaceAnchorPath));
  let directoryHandle;
  try {
    directoryHandle = await fs.open(fenceDirectory, 'r');
    const stat = await directoryHandle.stat();
    if (!stat.isDirectory()) {
      throw fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { fence_directory: fenceDirectory, reason: 'not-directory' });
    }
  } catch (error) {
    await directoryHandle?.close().catch(() => undefined);
    if (error?.code === 'PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE') throw error;
    throw fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { cause: error, fence_directory: fenceDirectory });
  }

  // fd 4 is inherited from the already-open directory handle. `flock -n 4`
  // locks that exact open-file description; the shell then stays alive on stdin
  // so the lock remains continuously held until release or parent crash.
  const child = spawn(
    'sh',
    [
      '-c',
      'flock --exclusive --nonblock 4 || exit 42; printf "READY\\n" >&3; IFS= read -r _ || true',
    ],
    { stdio: ['pipe', 'ignore', 'pipe', 'pipe', directoryHandle.fd] },
  );

  let released = false;
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  const ready = await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    child.once('error', (error) => {
      finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { cause: error, fence_directory: fenceDirectory }));
    });
    child.once('exit', (code, signal) => {
      if (code === 42) {
        finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_BUSY', { fence_directory: fenceDirectory, retryable: true }));
        return;
      }
      if (code !== 0) {
        finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { fence_directory: fenceDirectory, code, signal, stderr }));
      }
    });

    let marker = '';
    child.stdio[3].setEncoding('utf8');
    child.stdio[3].on('data', (chunk) => {
      marker += chunk;
      if (marker.includes('READY\n')) finish(resolve, true);
    });
  }).finally(async () => {
    // The shell has inherited its own descriptor by this point. Closing the
    // parent's duplicate cannot release the lock while the shell is alive.
    await directoryHandle.close().catch(() => undefined);
  });

  if (!ready) throw fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { fence_directory: fenceDirectory });

  return Object.freeze({
    fence_directory: fenceDirectory,
    async release() {
      if (released) return;
      released = true;
      child.stdin.end();
      const result = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code, signal) => resolve({ code, signal }));
      });
      if (result.code !== 0) {
        throw fail('PROJECT_FILE_KERNEL_FENCE_RELEASE_FAILED', { fence_directory: fenceDirectory, ...result, stderr });
      }
    },
  });
}
