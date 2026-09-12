// BASIC-CHAT server: loopback-only HTTP surface over createLocalChat.
import { createServer } from 'node:http';
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

export async function startBasicChat({ root, port = 0 } = {}) {
  if (!root) throw new TypeError('root is required');
  const chat = await createLocalChat({ root });
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
  return {
    url: `http://127.0.0.1:${address.port}`,
    port: address.port,
    close: async () => {
      await new Promise((done, reject) => server.close((e) => (e ? reject(e) : done())));
      await chat.close();
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve('.basic-chat');
  await installLocal({ root });
  const app = await startBasicChat({ root, port: 4317 });
  console.log(`Basic Chat: ${app.url}\nDRY_RUN; autonomy disabled. State: ${root}`);
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.close();
      process.exit(0);
    });
  }
}
