import assert from 'node:assert/strict';
import {
  formatLocalDeterministicDemo,
  runLocalDeterministicDemo,
} from '../scripts/demo-local-mission.mjs';

const summary = await runLocalDeterministicDemo();
assert.equal(summary.mode, 'deterministic-local-mock');
assert.equal(summary.verified, true);
assert.equal(summary.stepCount, 2);
assert.equal(summary.checkpointCreated, true);
assert.equal(summary.recovery.completed, true);
assert.equal(summary.recovery.recovered, true);
assert.equal(summary.recovery.finalProviderId, 'demo_provider_fallback');
assert.equal(summary.eventTypes.includes('provider.failed'), true);
assert.equal(summary.eventTypes.includes('run.recovered'), true);
assert.equal(summary.eventTypes.at(-1), 'overseer.audit.completed');
assert.deepEqual(summary.overseer.findingCodes, ['PROVIDER_FAILURE_RECOVERED']);
assert.equal(summary.overseer.ownerActionRequired, true);

const rendered = formatLocalDeterministicDemo(summary);
assert.deepEqual(JSON.parse(rendered), summary);
assert.equal(rendered.includes('bounded-local-demo'), false);
assert.throws(() => formatLocalDeterministicDemo({ mode: 'external' }), /local deterministic demo summary/);

console.log('CORE-002 local deterministic demo tests passed');
