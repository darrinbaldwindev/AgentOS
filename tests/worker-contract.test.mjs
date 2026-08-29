import test from 'node:test';
import assert from 'node:assert/strict';
import { executeWorker, validateWorker } from '../src/workers/worker-contract.mjs';

test('worker contract executes provider-independent worker', async () => {
  const worker = { id: 'skill:test', capabilities: ['test'], execute: async ({ message }) => `processed:${message}` };
  const result = await executeWorker(worker, { message: 'hello' });
  assert.equal(result.workerId, 'skill:test');
  assert.equal(result.output, 'processed:hello');
  assert.equal(result.success, true);
});

test('worker contract converts execution errors into structured failures', async () => {
  const worker = { id: 'skill:fail', capabilities: ['test'], execute: async () => { throw new Error('failed'); } };
  const result = await executeWorker(worker, {});
  assert.equal(result.success, false);
  assert.equal(result.error, 'failed');
});

test('invalid workers are rejected before execution', () => {
  assert.throws(() => validateWorker({ id: 'bad', capabilities: [] }), /execute/);
});
