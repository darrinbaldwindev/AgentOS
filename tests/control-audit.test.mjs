import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl, applyControlAction } from '../src/dispatch/control.mjs';
import { createAuditEvent, appendAuditEvent } from '../src/dispatch/audit.mjs';

test('kill is terminal for the runtime instance', () => {
  const killed = applyControlAction(createRuntimeControl(), 'kill');
  assert.throws(() => applyControlAction(killed, 'resume'), /killed/);
  assert.equal(killed.killed, true);
  assert.equal(killed.paused, true);
});

test('audit events are append-only values with actor and timestamp', () => {
  const event = createAuditEvent({ type: 'runtime.kill', actor: 'operator', taskId: 'task-1', now: Date.parse('2026-08-28T00:00:00Z') });
  assert.equal(event.type, 'runtime.kill');
  assert.equal(event.actor, 'operator');
  assert.equal(event.task_id, 'task-1');
  assert.equal(event.occurred_at, '2026-08-28T00:00:00.000Z');
  assert.equal(appendAuditEvent([], event).length, 1);
});
