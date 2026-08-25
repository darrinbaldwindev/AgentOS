import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';
import { createOverseerAuditor } from '../runtime/overseer-auditor.mjs';

test('canonical Overseer auditor persists recommendation and audit event', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  const run = await persistence.create('run', { id: 'run:overseer-test', status: 'completed' });
  await persistence.create('event', { runId: run.id, eventType: 'run.completed' });

  const auditor = createOverseerAuditor({ persistence });
  const result = await auditor.auditRun(run.id);

  assert.equal(result.audit.severity, 'info');
  const artifacts = await persistence.list('artifact');
  const events = await persistence.list('event');
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].id, result.changeLogId);
  assert.equal(events.filter((event) => event.eventType === 'overseer.audit.completed').length, 1);
});
