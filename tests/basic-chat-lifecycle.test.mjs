import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createConnection } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';
import { startBasicChat } from '../runtime/basic-chat-server.mjs';

function portOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function waitForOutput(child, pattern, timeoutMs = 10000) {
  let output = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for child output: ${output}`)), timeoutMs);
    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(pattern);
      if (match) {
        clearTimeout(timer);
        child.stdout.off('data', onData);
        resolve({ output, match });
      }
    };
    child.stdout.on('data', onData);
    child.once('exit', (code, signal) => {
      if (!pattern.test(output)) {
        clearTimeout(timer);
        reject(new Error(`child exited before ready: code=${code} signal=${signal} output=${output}`));
      }
    });
  });
}

function assertOrderedStages(stages, expected) {
  let cursor = -1;
  for (const stage of expected) {
    const next = stages.indexOf(stage, cursor + 1);
    assert.notEqual(next, -1, `missing lifecycle stage ${stage}; got ${stages.join(', ')}`);
    cursor = next;
  }
}

describe('Mission D-REPAIR: Basic Chat host lifecycle + lock', () => {
  it('A/B: start creates lock and remains listening', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-ab-'));
    try {
      await installLocal({ root });
      const app = await startBasicChat({ root, port: 0 });
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      assert.equal(await portOpen(app.port), true);
      const lock = JSON.parse(await readFile(join(root, 'basic-chat.lock'), 'utf8'));
      assert.equal(lock.pid, process.pid);
      await app.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('C: second active host is rejected', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-c-'));
    try {
      await installLocal({ root });
      const app = await startBasicChat({ root, port: 0 });
      await assert.rejects(() => startBasicChat({ root, port: 0 }), /BASIC_CHAT_ALREADY_RUNNING/);
      await app.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('D/E/F/G: one close path waits for server and chat cleanup before lifecycle completion', async () => {
    let releaseChatClose;
    let chatCloseStarted = false;
    const stages = [];
    const chatCloseGate = new Promise((resolve) => {
      releaseChatClose = resolve;
    });
    const fakeChat = {
      snapshot: async () => ({}),
      send: async () => ({}),
      control: async () => ({}),
      close: async () => {
        chatCloseStarted = true;
        await chatCloseGate;
      },
    };
    const app = await startBasicChat({
      root: 'test-root',
      port: 0,
      chatFactory: async () => fakeChat,
      lifecycleStage: (stage) => stages.push(stage),
    });
    let lifecycleSettled = false;
    const waiter = app.waitUntilClosed().then(() => {
      lifecycleSettled = true;
    });
    const close1 = app.close();
    const close2 = app.close();
    assert.strictEqual(close1, close2);

    for (let i = 0; i < 100 && (await portOpen(app.port)); i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    assert.equal(await portOpen(app.port), false);
    assert.equal(chatCloseStarted, true);
    assert.equal(lifecycleSettled, false);
    assertOrderedStages(stages, ['SERVER_CLOSE_START', 'SERVER_CLOSE_DONE', 'CHAT_CLOSE_START']);

    releaseChatClose();
    await close1;
    await waiter;
    assert.equal(lifecycleSettled, true);
    assert.equal(stages.at(-1), 'WAITUNTILCLOSED_RESOLVE');
  });

  it('H/I/J: normal close releases port, removes lock before waiter resolves, restart works', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-hij-'));
    const stages = [];
    try {
      await installLocal({ root });
      const app1 = await startBasicChat({ root, port: 0, lifecycleStage: (stage) => stages.push(stage) });
      const port1 = app1.port;
      let waiterSawLock = true;
      const waiter = app1.waitUntilClosed().then(async () => {
        waiterSawLock = await fileExists(join(root, 'basic-chat.lock'));
      });
      await app1.close();
      await waiter;
      assert.equal(waiterSawLock, false);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
      assert.equal(await portOpen(port1), false);
      assertOrderedStages(stages, [
        'SERVER_CLOSE_START',
        'SERVER_CLOSE_DONE',
        'CHAT_CLOSE_START',
        'LOCK_HANDLE_CLOSE_DONE',
        'LOCK_UNLINK_START',
        'LOCK_UNLINK_DONE',
        'WAITUNTILCLOSED_RESOLVE',
      ]);

      const app2 = await startBasicChat({ root, port: 0 });
      assert.equal(await portOpen(app2.port), true);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      await app2.close();
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('K/L: stale lock requires explicit recovery for all contenders', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-stale-'));
    try {
      await installLocal({ root });
      const payload = JSON.stringify({ pid: 999999, startedAt: '2020-01-01T00:00:00Z' });
      await writeFile(join(root, 'basic-chat.lock'), payload);
      const results = await Promise.allSettled([createLocalChat({ root }), createLocalChat({ root })]);
      for (const result of results) {
        assert.equal(result.status, 'rejected');
        assert.match(result.reason.message, /RECOVERY_REQUIRED/);
      }
      assert.equal(await readFile(join(root, 'basic-chat.lock'), 'utf8'), payload);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('M/N: conversation survives host restart without replay', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-mn-'));
    try {
      await installLocal({ root });
      const app1 = await startBasicChat({ root, port: 0 });
      const send1 = await fetch(`${app1.url}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'lifecycle message one' }),
      });
      const body1 = await send1.json();
      assert.equal(body1.status, 'COMPLETE');
      const historyLen = body1.history.length;
      await app1.close();

      const app2 = await startBasicChat({ root, port: 0 });
      const state = await (await fetch(`${app2.url}/api/state`)).json();
      assert.equal(state.history.length, historyLen);
      assert.ok(state.history.some((m) => m.text === 'lifecycle message one'));
      assert.equal(state.history.filter((m) => m.role === 'user').length, 1);
      await app2.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('O: lock cleanup failure is surfaced and not reported as closed', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-o-'));
    try {
      await installLocal({ root });
      const forced = Object.assign(new Error('forced unlink failure'), { code: 'EPERM' });
      const chat = await createLocalChat({
        root,
        unlinkLock: async () => {
          throw forced;
        },
      });
      await assert.rejects(() => chat.close(), (error) => error?.code === 'BASIC_CHAT_LOCK_RELEASE_FAILED');
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('closest supported CLI signal path exits only after lock removal', { skip: process.platform === 'win32' ? 'child.kill(SIGINT) force-terminates on Windows and is not console Ctrl+C' : false }, async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-signal-'));
    let child;
    try {
      child = spawn(process.execPath, ['runtime/basic-chat-server.mjs'], {
        cwd: process.cwd(),
        env: { ...process.env, AGENTOS_HOME: root, AGENTOS_CHAT_PORT: '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      const { match } = await waitForOutput(child, /Basic Chat: http:\/\/127\.0\.0\.1:(\d+)/);
      const port = Number(match[1]);
      assert.equal(await portOpen(port), true);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      assert.equal(child.kill('SIGINT'), true);
      const [code, signal] = await once(child, 'exit');
      assert.equal(signal, null);
      assert.equal(code, 0, stderr);
      assert.equal(await portOpen(port), false);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
      child = null;
    } finally {
      if (child && child.exitCode == null && child.signalCode == null) child.kill('SIGKILL');
      await rm(root, { recursive: true, force: true });
    }
  });

  it('Windows-native actual CLI ETX path performs full cleanup and immediate restart', { skip: process.platform !== 'win32' ? 'Windows-native only' : false }, async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-win-'));
    const traceFile = join(root, 'shutdown-trace.ndjson');
    let child;
    let restarted;
    try {
      const spawnCli = () => spawn(process.execPath, ['runtime/basic-chat-server.mjs'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          AGENTOS_HOME: root,
          AGENTOS_CHAT_PORT: '0',
          AGENTOS_TEST_CTRL_C_STDIN: '1',
          AGENTOS_SHUTDOWN_TRACE_FILE: traceFile,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      child = spawnCli();
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      const first = await waitForOutput(child, /Basic Chat: http:\/\/127\.0\.0\.1:(\d+)/);
      const firstPort = Number(first.match[1]);
      assert.equal(await portOpen(firstPort), true);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      child.stdin.write(Buffer.from([0x03]));
      const [firstCode] = await once(child, 'exit');
      assert.equal(firstCode, 0, stderr);
      assert.equal(await portOpen(firstPort), false);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
      child = null;

      const firstTrace = (await readFile(traceFile, 'utf8')).trim().split(/\r?\n/).map((line) => JSON.parse(line));
      assertOrderedStages(firstTrace.map((entry) => entry.stage), [
        'SIGNAL_RECEIVED',
        'SERVER_CLOSE_START',
        'SERVER_CLOSE_DONE',
        'CHAT_CLOSE_START',
        'LOCK_HANDLE_CLOSE_DONE',
        'LOCK_UNLINK_START',
        'LOCK_UNLINK_DONE',
        'WAITUNTILCLOSED_RESOLVE',
        'PROCESS_BEFORE_EXIT',
        'PROCESS_EXIT',
      ]);

      restarted = spawnCli();
      let restartErr = '';
      restarted.stderr.on('data', (chunk) => { restartErr += chunk.toString(); });
      const second = await waitForOutput(restarted, /Basic Chat: http:\/\/127\.0\.0\.1:(\d+)/);
      const secondPort = Number(second.match[1]);
      assert.equal(await portOpen(secondPort), true);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      restarted.stdin.write(Buffer.from([0x03]));
      const [secondCode] = await once(restarted, 'exit');
      assert.equal(secondCode, 0, restartErr);
      assert.equal(await portOpen(secondPort), false);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
      restarted = null;
    } finally {
      if (child && child.exitCode == null && child.signalCode == null) child.kill('SIGKILL');
      if (restarted && restarted.exitCode == null && restarted.signalCode == null) restarted.kill('SIGKILL');
      await rm(root, { recursive: true, force: true });
    }
  });
});
