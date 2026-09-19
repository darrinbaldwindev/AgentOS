import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rename, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { acquirePosixKernelFence } from '../runtime/posix-kernel-fence.mjs';

const skip = process.platform === 'win32';

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-kernel-fence-'));
  return {
    root,
    fence: path.join(root, '.project-file.kernel-fence'),
    metadataLock: path.join(root, 'fixture.txt.agentos-write-lock'),
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

test('stable POSIX kernel fence excludes a concurrent owner and can be reacquired after release', { skip }, async () => {
  const f = await fixture();
  try {
    const first = await acquirePosixKernelFence(f.fence);
    await assert.rejects(acquirePosixKernelFence(f.fence), {
      code: 'PROJECT_FILE_KERNEL_FENCE_BUSY',
      retryable: true,
    });
    await first.release();
    const second = await acquirePosixKernelFence(f.fence);
    await second.release();
    assert.ok(await stat(f.fence));
  } finally {
    await f.cleanup();
  }
});

test('metadata lock pathname replacement cannot create a second kernel fence owner', { skip }, async () => {
  const f = await fixture();
  try {
    await mkdir(f.metadataLock);
    const first = await acquirePosixKernelFence(f.fence);
    await rename(f.metadataLock, `${f.metadataLock}.displaced`);
    await mkdir(f.metadataLock);
    await assert.rejects(acquirePosixKernelFence(f.fence), {
      code: 'PROJECT_FILE_KERNEL_FENCE_BUSY',
      retryable: true,
    });
    await first.release();
  } finally {
    await f.cleanup();
  }
});

test('kernel fence is released when the owning Node process is killed', { skip }, async () => {
  const f = await fixture();
  try {
    const helperUrl = new URL('../runtime/posix-kernel-fence.mjs', import.meta.url).href;
    const source = `
      import { acquirePosixKernelFence } from ${JSON.stringify(helperUrl)};
      const lock = await acquirePosixKernelFence(${JSON.stringify(f.fence)});
      console.log('READY');
      setInterval(() => {}, 1000);
    `;
    const owner = spawn(process.execPath, ['--input-type=module', '-e', source], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    owner.stdout.setEncoding('utf8');
    await new Promise((resolve, reject) => {
      let text = '';
      owner.once('error', reject);
      owner.once('exit', (code, signal) => reject(new Error(`owner exited before READY: ${code}/${signal}`)));
      owner.stdout.on('data', (chunk) => {
        text += chunk;
        if (text.includes('READY\n')) resolve();
      });
    });

    await assert.rejects(acquirePosixKernelFence(f.fence), {
      code: 'PROJECT_FILE_KERNEL_FENCE_BUSY',
      retryable: true,
    });

    owner.kill('SIGKILL');
    await new Promise((resolve) => owner.once('exit', resolve));

    let acquired = null;
    for (let attempt = 0; attempt < 20 && acquired === null; attempt += 1) {
      try {
        acquired = await acquirePosixKernelFence(f.fence);
      } catch (error) {
        if (error.code !== 'PROJECT_FILE_KERNEL_FENCE_BUSY') throw error;
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }
    assert.ok(acquired, 'kernel fence did not release after owner crash');
    await acquired.release();
  } finally {
    await f.cleanup();
  }
});
