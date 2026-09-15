import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from './local-chat.mjs';

export async function startBasicChat({ root, port = 0 } = {}) {
  const chat = await createLocalChat({ root });
  const assets = new Map([
    ['/', ['../ui/basic-chat.html', 'text/html']],
    ['/chat.js', ['../ui/basic-chat.js', 'text/javascript']],
    ['/chat.css', ['../ui/basic-chat.css', 'text/css']],
  ]);
  const server = createServer(async (req, res) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    function reply(status, value) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin)) return reply(403, { error: 'LOCAL_ORIGIN_REQUIRED' });
    try {
      if (req.method === 'GET' && assets.has(req.url)) {
        const [file, type] = assets.get(req.url);
        const body = await readFile(new URL(file, import.meta.url));
        res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); return res.end(body);
      }
      if (req.method === 'GET' && req.url === '/api/state') return reply(200, await chat.snapshot());
      if (req.method !== 'POST' || !['/api/send', '/api/control'].includes(req.url)) return reply(404, { error: 'NOT_FOUND' });
      if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') return reply(403, { error: 'LOCAL_JSON_REQUEST_REQUIRED' });
      let body = '';
      req.setEncoding('utf8');
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 20000) return reply(413, { error: 'REQUEST_TOO_LARGE' });
      }
      const input = JSON.parse(body);
      const result = req.url === '/api/send' ? await chat.send(input.text) : await chat.control(input.action);
      reply(200, result);
    } catch (error) { reply(400, { error: error.message }); }
  });
  server.requestTimeout = 10000;
  try { await new Promise((done, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', done); }); }
  catch (error) { await chat.close(); throw error; }
  return { url: `http://127.0.0.1:${server.address().port}`, close: async () => {
    await new Promise((done, reject) => server.close(error => error ? reject(error) : done())); await chat.close();
  } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  // Dedicated development home using the installed runtime format, never the scheduler home.
  const root = resolve('.basic-chat');
  await installLocal({ root });
  const app = await startBasicChat({ root, port: 4317 });
  console.log(`Basic Chat: ${app.url}\nDRY_RUN; autonomy disabled. State: ${root}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await app.close(); process.exit(0); });
}
