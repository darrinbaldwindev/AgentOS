import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { acquirePosixKernelFence } from '../runtime/posix-kernel-fence.mjs';

const skip = process.platform === 'win32';

async function waitForReady(owner) {
  owner.stdout.setEncoding('utf8');
  await new Promise((resolve, reject) => {
    let text = '';
    const onExit = (code, signal) => reject(new Error(`owner exited before READY: ${code}/${signal}`));
    owner.once('error', reject);
    owner.once('exit', onExit);
    owner.stdout.on('data', (chunk) => {
      text += chunk;
      if (text.includes('READY\n')) {
        owner.off('exit', onExit);
        resolve();
      }
    });
  });
}

function directChildren(pid) {
  const text = execFileSync('ps', ['-o', 'pid=', '--ppid', String(pid)], { encoding: 'utf8' });
  return text.split(/\s+/).map((value) => Number.parseInt(value, 10)).filter(Number.isInteger);
}

test('SG-08 baseline: killing only the helper fence holder releases ownership while the Node owner survives', { skip }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-kernel-holder-loss-'));
  const anchor = path.join(root, 'fixture.txt.agentos-kernel-fence');
  const helperUrl = new URL('../runtime/posix-kernel-fence.mjs', import.meta.url).href;
  const source = `
    import { acquirePosixKernelFence } from ${JSON.stringify(helperUrl)};
    globalThis.fence = await acquirePosixKernelFence(${JSON.stringify(anchor)});
    console.log('READY');
    setInterval(() => {}, 1000);
  `;
  const owner = spawn(process.execPath, ['--input-type=module', '-e', source], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForReady(owner);
    await assert.rejects(acquirePosixKernelFence(anchor), {
      code: 'PROJECT_FILE_KERNEL_FENCE_BUSY',
      retryable: true,
    });

    let children = directChildren(owner.pid);
    for (let attempt = 0; attempt < 20 && children.length === 0; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      children = directChildren(owner.pid);
    }
    assert.equal(children.length, 1, `expected one helper holder child, got ${children.join(',')}`);

    process.kill(children[0], 'SIGKILL');

    let successor = null;
    for (let attempt = 0; attempt < 40 && successor === null; attempt += 1) {
      try {
        successor = await acquirePosixKernelFence(anchor);
      } catch (error) {
        if (error?.code !== 'PROJECT_FILE_KERNEL_FENCE_BUSY') throw error;
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    assert.ok(successor, 'expected helper-holder death to release the kernel fence while the Node owner remained alive');
    assert.equal(owner.exitCode, null, 'Node owner unexpectedly exited with its helper holder');
    await successor.release();
  } finally {
    if (owner.exitCode === null) owner.kill('SIGKILL');
    await new Promise((resolve) => {
      if (owner.exitCode !== null) return resolve();
      owner.once('exit', resolve);
    });
    await rm(root, { recursive: true, force: true });
  }
});
