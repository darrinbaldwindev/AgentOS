// Bounded SG-08 primitive spike: stable POSIX advisory lock held by a child
// `flock` process. The lock file is intentionally never unlinked; deleting a
// flock file while it is locked would permit a successor to lock a new inode.
//
// This module grants no authority and is not wired into project-file mutation.
// It exists only to prove a crash-releasing kernel fence candidate on hosted
// POSIX runners before changing the canonical writer path.

import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

async function ensureStableFenceFile(fencePath) {
  let handle;
  try {
    handle = await fs.open(fencePath, 'a', 0o600);
    await handle.chmod(0o600);
    await handle.sync();
  } finally {
    await handle?.close();
  }
}

export async function acquirePosixKernelFence(fencePath) {
  if (process.platform === 'win32') {
    throw fail('PROJECT_FILE_KERNEL_FENCE_UNSUPPORTED_PLATFORM', { platform: process.platform });
  }
  if (typeof fencePath !== 'string' || fencePath.length === 0) {
    throw new TypeError('fencePath is required');
  }

  await ensureStableFenceFile(fencePath);

  const child = spawn(
    'flock',
    [
      '--exclusive',
      '--nonblock',
      fencePath,
      'sh',
      '-c',
      'printf "READY\\n" >&3; IFS= read -r _ || true',
    ],
    { stdio: ['pipe', 'ignore', 'pipe', 'pipe'] },
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
      finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { cause: error, fence: fencePath }));
    });
    child.once('exit', (code, signal) => {
      if (code === 1) {
        finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_BUSY', { fence: fencePath, retryable: true }));
        return;
      }
      if (code !== 0) {
        finish(reject, fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { fence: fencePath, code, signal, stderr }));
      }
    });

    let marker = '';
    child.stdio[3].setEncoding('utf8');
    child.stdio[3].on('data', (chunk) => {
      marker += chunk;
      if (marker.includes('READY\n')) finish(resolve, true);
    });
  });

  if (!ready) throw fail('PROJECT_FILE_KERNEL_FENCE_UNAVAILABLE', { fence: fencePath });

  return Object.freeze({
    fence: fencePath,
    async release() {
      if (released) return;
      released = true;
      child.stdin.end();
      const result = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code, signal) => resolve({ code, signal }));
      });
      if (result.code !== 0) {
        throw fail('PROJECT_FILE_KERNEL_FENCE_RELEASE_FAILED', { fence: fencePath, ...result, stderr });
      }
    },
  });
}
