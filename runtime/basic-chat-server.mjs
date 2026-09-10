// BASIC-CHAT server: loopback-only HTTP surface over createLocalChat.
import { createServer } from 'node:http';
import { appendFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createLocalChat } from './local-chat.mjs';
import { installLocal } from '../scripts/install-local.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_ROOT = join(__dirname, '..', 'ui');

const assets = new Map([
  ['/', ['basic-chat.html', 'text/html']],
  ['/chat.html', ['basic-chat.html', 'text/html']],
  ['/chat.js', ['basic-chat.js', 'text/javascript']],
  ['/chat.css', ['basic-chat.css', 'text/css']],
]);

function createLifecycleTracer(traceFile = process.env.AGENTOS_SHUTDOWN_TRACE_FILE) {
  return (stage, detail = null) => {
    if (!traceFile) return;
    try {
      appendFileSync(
        traceFile,
        `${JSON.stringify({ stage, pid: process.pid, at: new Date().toISOString(), detail })}\n`,
        { encoding: 'utf8' },
      );
    } catch {
      // Trace instrumentation must never change runtime behaviour.
    }
  };
}

export function installWindowsCtrlCInterceptor({
  stdin = process.stdin,
  platform = process.platform,
  onCtrlC,
  allowPipeForTest = process.env.AGENTOS_TEST_CTRL_C_STDIN === '1',
} = {}) {
  if (platform !== 'win32' || typeof onCtrlC !== 'function' || !stdin?.on) return null;

  const canUseRawTty = stdin.isTTY === true && typeof stdin.setRawMode === 'function';
  if (!canUseRawTty && !allowPipeForTest) return null;

  if (canUseRawTty) stdin.setRawMode(true);
  stdin.resume?.();

  const onData = (chunk) => {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    if (bytes.includes(0x03)) onCtrlC();
  };
  stdin.on('data', onData);

  return () => {
    stdin.off?.('data', onData);
    if (canUseRawTty) {
      try {
        stdin.setRawMode(false);
      } catch {}
    }
    stdin.pause?.();
  };
}

export async function startBasicChat({
  root,
  port = 0,
  chatFactory = createLocalChat,
  lifecycleStage = () => {},
} = {}) {
  if (!root) throw new TypeError('root is required');
  if (typeof chatFactory !== 'function') throw new TypeError('chatFactory must be a function');
  if (typeof lifecycleStage !== 'function') throw new TypeError('lifecycleStage must be a function');
  const chat = await chatFactory({ root, lifecycleStage });
  const originHost = '127.0.0.1';

  const server = createServer(async (req, res) => {
    const reply = (code, value) => {
      const body = JSON.stringify(value);
      res.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      });
      res.end(body);
    };

    try {
      const host = req.headers.host || '';
      if (!host.startsWith('127.0.0.1') && !host.startsWith('localhost')) {
        return reply(403, { error: 'LOCAL_ORIGIN_REQUIRED' });
      }
      if (req.headers.origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.origin)) {
        return reply(403, { error: 'LOCAL_ORIGIN_REQUIRED' });
      }

      const url = req.url?.split('?')[0] || '/';
      if (req.method === 'GET' && assets.has(url)) {
        const [file, type] = assets.get(url);
        const body = await readFile(join(UI_ROOT, file));
        res.writeHead(200, {
          'Content-Type': `${type}; charset=utf-8`,
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        return res.end(body);
      }
      if (req.method === 'GET' && url === '/api/state') {
        return reply(200, await chat.snapshot());
      }
      if (req.method !== 'POST' || !['/api/send', '/api/control'].includes(url)) {
        return reply(404, { error: 'NOT_FOUND' });
      }
      if (req.headers['content-type'] && !String(req.headers['content-type']).includes('application/json')) {
        return reply(403, { error: 'LOCAL_JSON_REQUEST_REQUIRED' });
      }
      let body = '';
      req.setEncoding('utf8');
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 20000) return reply(413, { error: 'REQUEST_TOO_LARGE' });
      }
      const input = body ? JSON.parse(body) : {};
      if (input.greenEvaluate != null || input.autonomyEnabled != null || input.scheduler != null) {
        return reply(403, { error: 'INJECTION_REJECTED' });
      }
      const result =
        url === '/api/send' ? await chat.send(input.text) : await chat.control(input.action);
      reply(200, result);
    } catch (error) {
      reply(400, { error: error?.message ?? String(error) });
    }
  });

  server.requestTimeout = 120000;
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(port, originHost, done);
  });
  const address = server.address();

  let resolveClosed;
  let rejectClosed;
  const closedPromise = new Promise((resolve, reject) => {
    resolveClosed = resolve;
    rejectClosed = reject;
  });
  void closedPromise.catch(() => {});

  let closePromise = null;
  function close() {
    if (closePromise) return closePromise;
    closePromise = (async () => {
      const cleanupKeepAlive = setInterval(() => {}, 1000);
      try {
        lifecycleStage('SERVER_CLOSE_START');
        await new Promise((done, reject) => server.close((e) => (e ? reject(e) : done())));
        lifecycleStage('SERVER_CLOSE_DONE');
        lifecycleStage('CHAT_CLOSE_START');
        await chat.close();
        lifecycleStage('WAITUNTILCLOSED_RESOLVE');
        resolveClosed();
      } catch (error) {
        rejectClosed(error);
        throw error;
      } finally {
        clearInterval(cleanupKeepAlive);
      }
    })();
    return closePromise;
  }

  server.ref();

  return {
    url: `http://127.0.0.1:${address.port}`,
    port: address.port,
    close,
    waitUntilClosed: () => closedPromise,
  };
}

async function mainCli() {
  const root = resolve(process.env.AGENTOS_HOME || '.basic-chat');
  const trace = createLifecycleTracer();
  await installLocal({ root });
  const app = await startBasicChat({
    root,
    port: Number(process.env.AGENTOS_CHAT_PORT || 4317),
    lifecycleStage: trace,
  });
  console.log(`Basic Chat: ${app.url}`);
  console.log('DRY_RUN; autonomy disabled. State:', root);
  console.log('Listening. Press Ctrl+C to stop.');

  let shutdownPromise = null;
  const shutdown = (source) => {
    trace('SIGNAL_RECEIVED', source);
    if (!shutdownPromise) shutdownPromise = app.close();
    return shutdownPromise;
  };

  // On a real Windows TTY, raw mode prevents the console CTRL_C_EVENT from
  // becoming SIGINT. We consume the ETX byte ourselves, which keeps Windows
  // from terminating the process independently while async cleanup runs.
  // The test-only pipe seam exercises this exact CLI path on Windows CI but is
  // not a substitute for final physical console verification.
  const removeWindowsCtrlC = installWindowsCtrlCInterceptor({
    onCtrlC: () => {
      void shutdown('CTRL_C_ETX').catch(() => {});
    },
  });

  const handlers = new Map();
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    try {
      const handler = () => {
        void shutdown(signal).catch(() => {});
      };
      process.on(signal, handler);
      handlers.set(signal, handler);
    } catch {
      // signal may be unsupported on some platforms
    }
  }

  const beforeExitHandler = (code) => trace('PROCESS_BEFORE_EXIT', { code });
  const exitHandler = (code) => trace('PROCESS_EXIT', { code });
  process.on('beforeExit', beforeExitHandler);
  process.on('exit', exitHandler);

  try {
    await app.waitUntilClosed();
  } catch (error) {
    console.error('shutdown error:', error?.message ?? error);
    process.exitCode = 1;
  } finally {
    removeWindowsCtrlC?.();
    for (const [signal, handler] of handlers) {
      process.removeListener(signal, handler);
    }
  }
}

const isDirectCli =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectCli) {
  await mainCli();
}
