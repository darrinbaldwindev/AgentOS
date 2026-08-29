import test from 'node:test';
import assert from 'node:assert/strict';
import { activateWorker, listWorkers } from '../src/workers/registry.mjs';
import { rankWorkers, selectWorker } from '../src/workers/router.mjs';

const fixture = {
  schemaVersion: 1,
  workers: [
    { id: 'technical', status: 'active', subscriptionClass: 'technical-overseer', kind: 'model', capabilities: ['architecture', 'code-review'] },
    { id: 'research', status: 'active', subscriptionClass: 'research', kind: 'external-agent', capabilities: ['research'] },
    { id: 'offline-code', status: 'inactive-until-connected', subscriptionClass: 'engineering', kind: 'external-agent', capabilities: ['coding', 'testing'] },
  ],
};

test('lists workers by capability and active state', () => {
  assert.equal(listWorkers({ registryData: fixture, capability: 'architecture' }).length, 1);
  assert.equal(listWorkers({ registryData: fixture, capability: 'coding', activeOnly: true }).length, 0);
});

test('activation changes only the selected worker', () => {
  const updated = activateWorker(fixture, 'offline-code');
  assert.equal(updated.workers.find((worker) => worker.id === 'offline-code').status, 'active');
  assert.equal(updated.workers.find((worker) => worker.id === 'technical').status, 'active');
});

test('router selects an active capability match', () => {
  const worker = selectWorker({ capabilities: ['architecture'] }, { registryData: fixture });
  assert.equal(worker.id, 'technical');
});

test('router returns null when the only matching worker is inactive', () => {
  const worker = selectWorker({ capabilities: ['coding'] }, { registryData: fixture });
  assert.equal(worker, null);
});

test('router can prefer a worker explicitly named by the task', () => {
  const result = rankWorkers({ capabilities: ['architecture'], preferredWorkers: ['technical'] }, { registryData: fixture });
  assert.equal(result[0].worker.id, 'technical');
});
