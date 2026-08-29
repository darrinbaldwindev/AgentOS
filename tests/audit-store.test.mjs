import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuditStore } from '../src/dispatch/audit-store.mjs';

test('audit store appends events and prevents duplicate event ids', async () => {
  const events = [];
  const store = createAuditStore({
    readEvents: async () => events,
    appendEvent: async event => { events.push(event); return event; },
  });
  const event = { event_id: 'audit:1', type: 'runtime.start', actor: 'scheduler' };
  assert.equal((await store.record(event)).written, true);
  assert.equal((await store.record(event)).duplicate, true);
  assert.equal((await store.list()).length, 1);
});
