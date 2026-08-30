import test from 'node:test';
import assert from 'node:assert/strict';
import { createOverseerShWorker } from '../src/workers/overseer-sh-worker.mjs';

test('Overseer.sh adapter maps a successful REST response to the worker contract', async () => {
  let request;
  const worker = createOverseerShWorker({
    baseUrl: 'https://overseer.example.test',
    apiKey: 'test-key',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200, json: async () => ({ response: 'done' }) };
    },
  });
  const result = await worker.execute({ message: 'run the task', priority: 'normal' });
  assert.equal(result.success, true);
  assert.equal(result.output, 'done');
  assert.equal(request.url, 'https://overseer.example.test/api/chat');
  assert.equal(request.options.headers.authorization, 'Bearer test-key');
  assert.equal(JSON.parse(request.options.body).task.priority, 'normal');
});

test('Overseer.sh adapter exposes provider failures as structured worker failures', async () => {
  const worker = createOverseerShWorker({
    baseUrl: 'https://overseer.example.test',
    fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }),
  });
  const result = await worker.execute({ message: 'try' });
  assert.equal(result.success, false);
  assert.match(result.error, /HTTP 503/);
});
