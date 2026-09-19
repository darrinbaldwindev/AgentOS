import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { acquirePosixKernelFence } from '../runtime/posix-kernel-fence.mjs';

const skip = process.platform === 'win32';

async function waitForMarker(owner, marker) {
  owner.stdout.setEncoding('utf8');
  await new Promise((resolve, reject) => {
    let text = '';
    const onExit = (code, signal) => reject(new Error(`owner exited before ${marker}: ${code}/${signal}`));
    const onError = (error) => reject(error);
    const onData = (chunk) => {
      text += chunk;
      if (text.includes(`${marker}\n`)) {
        owner.off('exit', onExit);
        owner.off('error', onError);
        owner.stdout.off('data', onData);
        resolve();
      }
    };
    owner.once('error', onError);
    owner.once('exit', onExit);
    owner.stdout.on('data', onData);
  });
}

function directChildren(pid) {
  let text;
  try {
    text = execFileSync('ps', ['-o', 'pid=', '--ppid', String(pid)], { encoding: 'utf8' });
  } catch (error) {
    // procps `ps --ppid` exits 1 when there are no matching processes.
    // That is the expected steady state after the helper holder is killed.
    if (error?.status === 1) return [];
    throw error;
  }
  return text.split(/\s+/).map((value) => Number.parseInt(value, 10)).filter(Number.isInteger);
}

test('SG-08: killing only the helper cannot release ownership while the Node owner retains its directory fd', { skip }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-kernel-holder-loss-'));
  const anchor = path.join(root, 'fixture.txt.agentos-kernel-fence');
  const helperUrl = new URL('../runtime/posix-kernel-fence.mjs', import.meta.url).href;
  const source = `
    import { acquirePosixKernelFence } from ${JSON.stringify(helperUrl)};
    const fence = await acquirePosixKernelFence(${JSON.stringify(anchor)});
    console.log('READY');
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', async () => {
      await fence.release();
      console.log('RELEASED');
    });
    setInterval(() => {}, 1000);
  `;
  const owner = spawn(process.execPath, ['--input-type=module', '-e', source], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  try {
    await waitForMarker(owner, 'READY');
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
    for (let attempt = 0; attempt < 20 && directChildren(owner.pid).includes(children[0]); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    assert.equal(owner.exitCode, null, 'Node owner unexpectedly exited with its helper holder');
    await assert.rejects(acquirePosixKernelFence(anchor), {
      code: 'PROJECT_FILE_KERNEL_FENCE_BUSY',
      retryable: true,
    });

    owner.stdin.write('RELEASE\n');
    await waitForMarker(owner, 'RELEASED');

    const successor = await acquirePosixKernelFence(anchor);
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
